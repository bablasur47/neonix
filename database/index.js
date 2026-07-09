import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neonix';

let client;
let db;
const stores = new Map();
const now = () => Date.now();

export async function connect() {
  if (client) return db;
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db('neonix');
  return db;
}

export async function disconnect() {
  if (client) { try { await client.close(); } catch {} }
  stores.clear();
}

export function closeAll() { disconnect(); }
export function isConnected() { return !!(client && db); }
export function initDefaultTables() {}

function parseCols(str) {
  return str.split(',').map(c => c.trim().replace(/['"]/g, ''));
}

/* Parses simple SQL WHERE into a filter function */
function whereFn(whereClause, params) {
  if (!whereClause) return () => true;
  const bound = [...params];
  let pi = 0;

  const conds = whereClause.split(/\s+AND\s+/i).map(p => p.trim()).filter(Boolean);

  return (doc) => {
    for (const c of conds) {
      const dt = c.match(/datetime\((\w+)\)\s*(<=|>=|=)\s*datetime\('now'\)/i);
      if (dt) {
        const colVal = new Date(doc[dt[1]] || 0).getTime();
        if (dt[2] === '<=' && colVal > now()) return false;
        if (dt[2] === '>=' && colVal < now()) return false;
        if (dt[2] === '=' && Math.abs(colVal - now()) > 2000) return false;
        continue;
      }
      const dr = c.match(/(\w+)\s*(<=|>=|=|>|<|!=)\s*datetime\('now'\)/i);
      if (dr) {
        const colVal = new Date(doc[dr[1]] || 0).getTime();
        if (!cmp(colVal, dr[2], now())) return false;
        continue;
      }
      const eq = c.match(/(\w+)\s*(=|!=|>|<|>=|<=)\s*(\?|'[^']*'|"[^"]*"|\d+(?:\.\d+)?)/);
      if (eq) {
        const val = eq[3] === '?' ? bound[pi++] : (() => { const v = eq[3].replace(/^['"]|['"]$/g, ''); const n = Number(v); return !isNaN(n) && v !== '' ? n : v; })();
        if (!cmp(doc[eq[1]], eq[2], val)) return false;
        continue;
      }
      const bl = c.match(/(\w+)\s*=\s*(1|0)\b/);
      if (bl && doc[bl[1]] !== parseInt(bl[2])) return false;
    }
    return true;
  };
}

function cmp(a, op, b) {
  if (op === '=') return a == b;
  if (op === '!=') return a != b;
  if (op === '>') return a > b;
  if (op === '<') return a < b;
  if (op === '>=') return a >= b;
  if (op === '<=') return a <= b;
  return false;
}

function sortFn(orderBy) {
  if (!orderBy) return null;
  const dir = orderBy.dir;
  return (a, b) => {
    const av = a[orderBy.col], bv = b[orderBy.col];
    return av < bv ? -dir : av > bv ? dir : 0;
  };
}

function project(doc, projections) {
  if (!projections) return doc;
  const p = {};
  for (const key of Object.keys(projections)) p[key] = doc[key];
  return p;
}

function parseSQL(sql) {
  const s = sql.trim().replace(/\s+/g, ' ');
  const up = s.toUpperCase();

  if (up.startsWith('ALTER TABLE')) return { type: 'alter' };

  if (up.startsWith('SELECT')) {
    const m = s.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)/i);
    const cols = m ? m[1].trim() : '*';
    const table = m ? m[2] : '';
    const wm = s.match(/\bWHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|\s*$)/i);
    const where = wm ? wm[1].trim() : '';
    const om = s.match(/\bORDER\s+BY\s+(\w+)\s*(ASC|DESC)?/i);
    const order = om ? { col: om[1], dir: (om[2] || 'ASC').toUpperCase() === 'DESC' ? -1 : 1 } : null;
    const lm = s.match(/\bLIMIT\s+(\d+)/i);
    const limit = lm ? parseInt(lm[1]) : null;
    const proj = cols === '*' ? null : parseCols(cols).reduce((a, c) => { a[c] = 1; return a; }, {});
    return { type: 'select', table, where, order, limit, proj };
  }

  if (up.startsWith('INSERT')) {
    const isReplace = up.includes('OR REPLACE');
    const isIgnore = up.includes('OR IGNORE');
    const tm = s.match(/\bINTO\s+(\w+)/i);
    const table = tm ? tm[1] : '';
    const cm = s.match(/\(([^)]+)\)\s*VALUES/i);
    const cols = cm ? parseCols(cm[1]) : [];
    return { type: 'insert', table, cols, isReplace, isIgnore };
  }

  if (up.startsWith('UPDATE')) {
    const tm = s.match(/^UPDATE\s+(\w+)/i);
    const table = tm ? tm[1] : '';
    const sm = s.match(/SET\s+(.+?)(?:\s+WHERE|\s*$)/i);
    const setClause = sm ? sm[1].trim() : '';
    const setCols = [];
    setClause.split(',').forEach(sp => {
      const m2 = sp.match(/(\w+)\s*=\s*(\?|'[^']*'|\d+)/);
      if (m2) setCols.push({ col: m2[1], isParam: m2[2] === '?' });
    });
    const wm = s.match(/\bWHERE\s+(.+?)$/i);
    const where = wm ? wm[1].trim() : '';
    return { type: 'update', table, setCols, where };
  }

  if (up.startsWith('DELETE')) {
    const tm = s.match(/\bFROM\s+(\w+)/i);
    const table = tm ? tm[1] : '';
    const wm = s.match(/\bWHERE\s+(.+?)$/i);
    const where = wm ? wm[1].trim() : '';
    return { type: 'delete', table, where };
  }

  return { type: 'unknown' };
}

class MongoStore {
  constructor(collection) {
    this.collection = collection;
    this.name = collection.collectionName;
    this.cache = [];
    this.loaded = false;
  }

  async load() {
    if (!this.loaded) {
      const data = await this.collection.find({}).toArray();
      if (this.cache.length === 0) {
        this.cache = data;
      } else {
        const seen = new Set(this.cache.map(d => JSON.stringify(Object.values(d))));
        for (const doc of data) {
          if (!seen.has(JSON.stringify(Object.values(doc)))) {
            this.cache.push(doc);
          }
        }
      }
      this.loaded = true;
    }
  }

  query(sql) { return new QueryBuilder(this, parseSQL(sql)); }

  run(sql, params = []) {
    const p = parseSQL(sql);
    const bp = [...params];
    switch (p.type) {
      case 'alter': return;

      case 'insert': {
        const doc = { _table: p.table };
        p.cols.forEach((c, i) => doc[c] = bp[i]);
        if (p.isReplace && p.cols[0]) {
          const pk = p.cols[0];
          const idx = this.cache.findIndex(d => d[pk] === doc[pk] && (d._table === p.table || !d._table));
          if (idx >= 0) this.cache[idx] = doc;
          else this.cache.push(doc);
          this.collection.replaceOne({ [pk]: doc[pk], ...(p.table ? { _table: p.table } : {}) }, doc, { upsert: true }).catch(() => {});
        } else if (p.isIgnore) {
          const pk = p.cols[0];
          const exists = this.cache.some(d => d[pk] === doc[pk] && (d._table === p.table || !d._table));
          if (!exists) {
            this.cache.push(doc);
            this.collection.insertOne(doc).catch(() => {});
          }
        } else {
          this.cache.push(doc);
          this.collection.insertOne(doc).catch(() => {});
        }
        return;
      }

      case 'update': {
        const setVals = {};
        p.setCols.forEach(sc => { setVals[sc.col] = sc.isParam ? bp.shift() : sc.col; });
        const fn = whereFn(p.where, bp);
        this.cache.forEach(d => {
          if ((d._table === p.table || !d._table) && fn(d)) Object.assign(d, setVals);
        });
        const mongoFilter = { ...mongoFilterFromWhere(p.where, bp), ...(p.table ? { _table: p.table } : {}) };
        this.collection.updateMany(mongoFilter, { $set: setVals }).catch(() => {});
        return;
      }

      case 'delete': {
        const fn = whereFn(p.where, bp);
        const changes = { count: 0 };
        this.cache = this.cache.filter(d => {
          if ((d._table === p.table || !d._table) && fn(d)) { changes.count++; return false; }
          return true;
        });
        const mongoFilter = { ...mongoFilterFromWhere(p.where, bp), ...(p.table ? { _table: p.table } : {}) };
        this.collection.deleteMany(mongoFilter).catch(() => {});
        return { changes: changes.count };
      }

      default: return;
    }
  }
}

function mongoFilterFromWhere(where, params) {
  if (!where) return {};
  const bound = [...params];
  let pi = 0;
  const filter = {};

  const conds = where.split(/\s+AND\s+/i).map(p => p.trim()).filter(Boolean);
  for (const c of conds) {
    const eq = c.match(/(\w+)\s*=\s*(\?|'[^']*'|\d+)/);
    if (eq && eq[2] === '?') {
      filter[eq[1]] = bound[pi++];
      continue;
    }
    if (eq) {
      const v = eq[2].replace(/^['"]|['"]$/g, '');
      const n = Number(v);
      filter[eq[1]] = !isNaN(n) && v !== '' ? n : v;
      continue;
    }
    const bl = c.match(/(\w+)\s*=\s*(1|0)\b/);
    if (bl) {
      filter[bl[1]] = parseInt(bl[2]);
      continue;
    }
    const ne = c.match(/(\w+)\s*!=\s*(\?|'[^']*'|\d+)/);
    if (ne) {
      const v = ne[2] === '?' ? bound[pi++] : (() => { const x = ne[2].replace(/^['"]|['"]$/g, ''); const n = Number(x); return !isNaN(n) && x !== '' ? n : x; })();
      filter[ne[1]] = { $ne: v };
      continue;
    }
    const cmp = c.match(/(\w+)\s*(>|<|>=|<=)\s*(\?|\d+)/);
    if (cmp) {
      const opMap = { '>': '$gt', '<': '$lt', '>=': '$gte', '<=': '$lte' };
      const v = cmp[3] === '?' ? bound[pi++] : parseInt(cmp[3]);
      filter[cmp[1]] = { [opMap[cmp[2]]]: v };
      continue;
    }
    const dt = c.match(/(\w+)\s*(<=|>=|=)\s*datetime\('now'\)/i);
    if (dt) {
      const opMap = { '<=': '$lte', '>=': '$gte', '=': '$lte' };
      filter[dt[1]] = { [opMap[dt[2]]]: new Date() };
      continue;
    }
  }
  return filter;
}

class QueryBuilder {
  constructor(store, parsed) {
    this.store = store;
    this.p = parsed;
  }

  get(...params) {
    const p = this.p;
    if (p.type === 'unknown') return null;
    const fn = whereFn(p.where, params);
    let results = this.store.cache.filter(d => {
      if (p.table && d._table && d._table !== p.table) return false;
      return fn(d);
    });
    const s = sortFn(p.order);
    if (s) results.sort(s);
    if (p.limit) results = results.slice(0, p.limit);
    const doc = results[0] || null;
    return doc ? project(doc, p.proj) : null;
  }

  all(...params) {
    const p = this.p;
    if (p.type === 'unknown') return [];
    const fn = whereFn(p.where, params);
    let results = this.store.cache.filter(d => {
      if (p.table && d._table && d._table !== p.table) return false;
      return fn(d);
    });
    const s = sortFn(p.order);
    if (s) results.sort(s);
    if (p.limit) results = results.slice(0, p.limit);
    return p.proj ? results.map(d => project(d, p.proj)) : results;
  }
}

export function getDb(name) {
  if (!db) throw new Error('Database not connected. Call connect() first.');
  if (stores.has(name)) return stores.get(name);
  const store = new MongoStore(db.collection(name));
  stores.set(name, store);
  store.load();
  return store;
}

export default { connect, disconnect, getDb, initDefaultTables, closeAll, isConnected };
