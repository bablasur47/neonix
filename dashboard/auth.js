import config from '../util/config.js';
import { getDb } from '../database/index.js';

const sessions = new Map();
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

function saveSession(id, data) {
  try {
    const db = getDb('dashboard');
    db.run('INSERT OR REPLACE INTO sessions (id, user_id, access_token, user_data, guilds_data, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.userId, data.accessToken, JSON.stringify(data.user), JSON.stringify(data.guilds), data.expiresAt]);
  } catch {}
}

function deleteSession(id) {
  try {
    const db = getDb('dashboard');
    db.run('DELETE FROM sessions WHERE id = ?', [id]);
  } catch {}
}

export function loadSessions() {
  try {
    const db = getDb('dashboard');
    const rows = db.query('SELECT * FROM sessions WHERE expires_at > ?').all(Date.now());
    for (const row of rows) {
      sessions.set(row.id, {
        userId: row.user_id,
        accessToken: row.access_token,
        user: typeof row.user_data === 'string' ? JSON.parse(row.user_data) : row.user_data,
        guilds: typeof row.guilds_data === 'string' ? JSON.parse(row.guilds_data) : row.guilds_data,
        expiresAt: typeof row.expires_at === 'number' ? row.expires_at : new Date(row.expires_at).getTime(),
      });
    }
  } catch {}
}

setInterval(() => {
  const now = Date.now();
  try {
    const db = getDb('dashboard');
    for (const [id, s] of sessions) {
      if (now > s.expiresAt) {
        sessions.delete(id);
        db.run('DELETE FROM sessions WHERE id = ?', [id]);
      }
    }
    db.run('DELETE FROM sessions WHERE expires_at <= ?', [now]);
  } catch {}
}, 60000);

export function getSession(sessionId) {
  if (!sessionId) return null;
  const s = sessions.get(sessionId);
  if (!s) return null;
  if (Date.now() > s.expiresAt) {
    sessions.delete(sessionId);
    deleteSession(sessionId);
    return null;
  }
  s.expiresAt = Date.now() + SESSION_TTL;
  saveSession(sessionId, s);
  return s;
}

export function createSession(userId, accessToken, user, guilds) {
  const id = crypto.randomUUID();
  const data = { userId, accessToken, user, guilds, expiresAt: Date.now() + SESSION_TTL };
  sessions.set(id, data);
  saveSession(id, data);
  return id;
}

export function destroySession(sessionId) {
  sessions.delete(sessionId);
  deleteSession(sessionId);
}

export function getOAuthURL(redirectUri) {
  const url = new URL('https://discord.com/api/oauth2/authorize');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'identify guilds');
  return url.toString();
}

export async function exchangeCode(code, redirectUri) {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OAuth token exchange failed: ${res.status} ${err}`);
  }

  return res.json();
}

export async function fetchUser(accessToken) {
  const res = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
  return res.json();
}

export async function fetchGuilds(accessToken) {
  const res = await fetch('https://discord.com/api/users/@me/guilds?with_counts=true', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch guilds: ${res.status}`);
  return res.json();
}
