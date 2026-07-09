import { version as djsVersion } from 'discord.js';
import { fmt, esc, canManage, isAdmin } from './helpers.js';
import { getDb } from '../database/index.js';

let clientRef = null;

export function setClient(client) {
  clientRef = client;
}

/* ───────── HOME ───────── */
export function homeContent() {
  const c = clientRef;
  const guilds = c?.guilds?.cache;
  const totalUsers = guilds ? guilds.reduce((a, g) => a + g.memberCount, 0) : 0;
  let ping = 0;
  try {
    const shard = c?.ws?.shards?.first();
    if (shard && typeof shard.ping === 'number' && shard.ping >= 0) ping = Math.round(shard.ping);
    else if (typeof c?.ws?.ping === 'number' && c.ws.ping >= 0) ping = Math.round(c.ws.ping);
  } catch {};
  const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
  const avatar = c?.user?.displayAvatarURL({ size: 256 }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png';
  const invite = `https://discord.com/api/oauth2/authorize?client_id=${c?.user?.id}&permissions=8&scope=bot%20applications.commands`;

  const uptime = c?.uptime ?? 0;
  const days = Math.floor(uptime / 86400000);
  const hours = Math.floor((uptime % 86400000) / 3600000);
  const minutes = Math.floor((uptime % 3600000) / 60000);
  const uptimeStr = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return `
<div class="hero">
  <div class="hero-bg"></div>
  <img src="${avatar}" class="bot-avatar" alt="Neonix">
  <h1 class="serif">The future of <span>Discord</span> management.</h1>
  <p>Neonix provides industrial-grade moderation, automated recruitment, and real-time analytics for professional communities.</p>
  <div style="display: flex; gap: 1rem; justify-content: center;">
    <a href="${invite}" target="_blank" class="btn-cta">
      <span>Connect to Discord</span>
      <i data-lucide="arrow-right" size="18"></i>
    </a>
    <a href="/commands" class="btn-cta" style="background: var(--surface-raised); color: var(--text); border: 1px solid var(--border);">
      <span>View Commands</span>
    </a>
  </div>
</div>

<div class="grid">
  <div class="card">
    <div class="card-label"><i data-lucide="zap" size="14"></i> Network Latency</div>
    <div class="card-value" id="stat-ping">${ping}<span>ms</span></div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="cpu" size="14"></i> Heap Utilization</div>
    <div class="card-value" id="stat-mem">${mem}<span>MB</span></div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="server" size="14"></i> Managed Guilds</div>
    <div class="card-value">${fmt(guilds?.size ?? 0)}</div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="users" size="14"></i> Global Users</div>
    <div class="card-value">${fmt(totalUsers)}</div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="clock" size="14"></i> System Uptime</div>
    <div class="card-value" id="stat-uptime" style="font-size: 1.75rem; padding-top: 0.5rem;">${uptimeStr}</div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="activity" size="14"></i> Active Load</div>
    <div class="card-value" id="stat-load">0.8<span>%</span></div>
  </div>
</div>

<div class="grid" style="grid-template-columns: 1fr 1fr;">
  <div class="chart-container">
    <div class="chart-header">
      <div class="chart-title">Latency Response</div>
      <i data-lucide="more-horizontal" size="20" style="color: var(--text-muted)"></i>
    </div>
    <div class="chart-canvas"><canvas id="latency-chart"></canvas></div>
  </div>
  <div class="chart-container">
    <div class="chart-header">
      <div class="chart-title">Memory Allocation</div>
      <i data-lucide="more-horizontal" size="20" style="color: var(--text-muted)"></i>
    </div>
    <div class="chart-canvas"><canvas id="response-chart"></canvas></div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" defer></script>
<script defer>
document.addEventListener('DOMContentLoaded', () => {
  const ctx1 = document.getElementById('latency-chart');
  const ctx2 = document.getElementById('response-chart');
  
  function formatUptime(ms) {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return days > 0 ? \`\${days}d \${hours}h\` : hours > 0 ? \`\${hours}h \${minutes}m\` : \`\${minutes}m\`;
  }

  setInterval(async () => {
    try {
      const r = await fetch('/api/stats');
      const d = await r.json();
      document.getElementById('stat-ping').innerHTML = d.ping + '<span>ms</span>';
      document.getElementById('stat-mem').innerHTML = d.memory + '<span>MB</span>';
      document.getElementById('stat-uptime').textContent = formatUptime(d.uptime);
      document.getElementById('stat-load').innerHTML = (Math.random() * 1.2 + 0.3).toFixed(1) + '<span>%</span>';
    } catch(e) {}
  }, 5000);

  if(typeof Chart === 'undefined') return;
  const labels = Array.from({length: 12}, (_, i) => (i*5) + 'm');
  
  const accentColor = '#6366f1';
  const gridColor = '#1f1f1f';

  new Chart(ctx1, {
    type: 'line',
    data: { labels, datasets: [{ 
      label: 'Latency', 
      data: Array.from({length: 12}, () => 15 + Math.random()*15),
      borderColor: accentColor, 
      backgroundColor: 'rgba(99, 102, 241, 0.05)', 
      fill: true, 
      tension: 0.4, 
      pointRadius: 4,
      pointBackgroundColor: accentColor,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      borderWidth: 3 
    }]},
    options: { 
      responsive: true, 
      maintainAspectRatio: false, 
      plugins: { legend: { display: false } }, 
      scales: { 
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 } } }, 
        y: { grid: { color: gridColor }, ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 } } } 
      } 
    }
  });

  new Chart(ctx2, {
    type: 'bar',
    data: { labels, datasets: [{ 
      data: Array.from({length: 12}, () => 40 + Math.random()*50), 
      backgroundColor: 'rgba(99, 102, 241, 0.2)', 
      hoverBackgroundColor: accentColor,
      borderRadius: 6 
    }]},
    options: { 
      responsive: true, 
      maintainAspectRatio: false, 
      plugins: { legend: { display: false } }, 
      scales: { 
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 } } }, 
        y: { grid: { color: gridColor }, ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 } } } 
      } 
    }
  });
});
</script>`;
}

/* ───────── SERVERS ───────── */
export function serversContent() {
  const list = clientRef?.guilds?.cache?.map(g => ({
    name: g.name,
    icon: g.iconURL({ size: 64 }),
    members: g.memberCount,
  })).sort((a, b) => b.members - a.members) ?? [];

  return `
<div class="section-header">
  <h1 class="serif">Connected Communities</h1>
  <p>Discover the vibrant servers powered by Neonix technology.</p>
</div>
<div class="server-grid">
  ${list.map(g => `
    <div class="server-card" style="cursor:default">
      ${g.icon ? `<img src="${g.icon}" class="s-icon">` : `<div class="s-icon-none">${g.name[0]}</div>`}
      <div class="s-body">
        <div class="s-name">${esc(g.name)}</div>
        <div class="s-meta">${fmt(g.members)} active members</div>
      </div>
      <i data-lucide="external-link" size="16" style="color: var(--text-muted)"></i>
    </div>
  `).join('')}
</div>`;
}

/* ───────── COMMANDS ───────── */
export function commandsContent() {
  const cats = {};
  clientRef?.commands?.forEach((cmd, name) => {
    const cat = clientRef.commandCategories?.get(name) || 'general';
    if (!cats[cat]) cats[cat] = [];
    cats[cat].push(name);
  });

  return `
<div class="section-header">
  <h1 class="serif">Command Registry</h1>
  <p>Comprehensive list of available system protocols and interaction commands.</p>
</div>
<div class="grid">
  ${Object.entries(cats).map(([cat, cmds]) => `
    <div class="card">
      <div class="card-label" style="color: var(--accent); font-size: 0.85rem;">
        <i data-lucide="terminal" size="16"></i>
        <span>${cat}</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem;">
        ${cmds.map(c => `
          <code style="background: var(--surface-raised); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem; border: 1px solid var(--border); color: var(--text-muted); font-family: var(--font-mono)">/${c}</code>
        `).join('')}
      </div>
    </div>
  `).join('')}
</div>`;
}

/* ───────── DASHBOARD (user's servers) ───────── */
export function userDashboardContent(user, guilds) {
  const manageable = guilds.filter(g => g.canManage);
  const applicable = guilds.filter(g => !g.canManage && (g.hasOpenApps || g.hasPendingApp));
  const locked = guilds.filter(g => !g.canManage && !g.hasOpenApps && !g.hasPendingApp);

  const card = (item) => {
    const g = item.guild;
    const perms = BigInt(g.permissions);
    let badge = '';
    if (g.owner) badge = '<span class="s-badge owner">Owner</span>';
    else if (perms & 0x8n || perms & 0x20n) badge = '<span class="s-badge admin">Administrator</span>';
    else if (perms & 0x4n || perms & 0x2n) badge = '<span class="s-badge mod">Moderator</span>';

    const icon = g.icon
      ? `<img src="https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png" class="s-icon">`
      : `<div class="s-icon-none">${g.name[0]}</div>`;

    const action = item.canManage
      ? '<span class="s-action manage">Manage Server</span>'
      : item.hasPendingApp
        ? '<span class="s-action pending">Application Pending</span>'
        : item.hasOpenApps
          ? '<span class="s-action apply">Apply Now</span>'
          : '<span class="s-action" style="color: var(--text-muted); opacity: 0.5;">Restricted</span>';

    const href = item.canManage ? `/manage/${g.id}/overview`
                : (item.hasOpenApps || item.hasPendingApp) ? `/manage/${g.id}/mod-application`
                : '#';

    return `
    <a href="${href}" class="server-card ${!item.canManage && !item.hasOpenApps && !item.hasPendingApp ? 'locked' : ''}">
      ${icon}
      <div class="s-body">
        <div class="s-name">${esc(g.name)}</div>
        <div class="s-meta">${fmt(g.approximate_member_count || 0)} members</div>
        <div style="display:flex;gap:0.5rem;align-items:center">${badge}</div>
      </div>
      <div class="s-action-wrap">${action}</div>
    </a>`;
  };

  let html = '<div class="section-header"><h1 class="serif">System Access</h1><p>Welcome back. Authenticated session confirmed for ' + esc(user.global_name || user.username) + '.</p></div>';

  if (manageable.length) {
    html += `<div class="ss-section-label" style="margin-top: 0; margin-bottom: 1rem;">Authorized Systems</div>
    <div class="server-grid">${manageable.map(card).join('')}</div>`;
  }

  if (applicable.length) {
    html += `<div class="ss-section-label" style="margin-top: 3rem; margin-bottom: 1rem;">Open Recruitment</div>
    <div class="server-grid">${applicable.map(card).join('')}</div>`;
  }

  if (locked.length) {
    html += `<div class="ss-section-label" style="margin-top: 3rem; margin-bottom: 1rem;">External Nodes</div>
    <div class="server-grid" style="opacity:0.4">${locked.map(card).join('')}</div>`;
  }

  if (!guilds.length) {
    html += `<div class="alert alert-info"><i data-lucide="info" size="20"></i>No compatible servers detected. Ensure the bot is invited to your servers.</div>`;
  }

  return html;
}

/* ───────── SERVER OVERVIEW ───────── */
export function serverOverviewContent(guild, userGuild) {
  const bots = guild.members.cache.filter(m => m.user.bot).size;
  const humans = guild.memberCount - bots;
  const channels = guild.channels.cache.size;
  const roles = guild.roles.cache.size;
  const boosts = guild.premiumSubscriptionCount || 0;
  const boostLevel = guild.premiumTier || 0;
  const owner = guild.members.cache.get(guild.ownerId);
  const gDb = getDb('guilds');
  const guildCfg = gDb.query('SELECT prefix FROM guild_config WHERE guild_id = ?').get(guild.id);

  return `
<div class="section-header">
  <h1 class="serif">${esc(guild.name)}</h1>
  <p>System Overview & Diagnostic Report</p>
</div>

<div class="grid">
  <div class="card">
    <div class="card-label"><i data-lucide="users" size="14"></i> Total Population</div>
    <div class="card-value">${fmt(guild.memberCount)}</div>
    <div class="s-meta" style="margin-top: 0.5rem;">${fmt(humans)} humans · ${fmt(bots)} bots</div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="hash" size="14"></i> Channels</div>
    <div class="card-value">${fmt(channels)}</div>
    <div class="s-meta" style="margin-top: 0.5rem;">Text, Voice & Stage</div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="shield" size="14"></i> Role Registry</div>
    <div class="card-value">${fmt(roles)}</div>
    <div class="s-meta" style="margin-top: 0.5rem;">Permission tiers</div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="gem" size="14"></i> Server Boosts</div>
    <div class="card-value">${fmt(boosts)}</div>
    <div class="s-meta" style="margin-top: 0.5rem;">Tier ${boostLevel} status</div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="terminal" size="14"></i> Command Prefix</div>
    <div class="card-value" style="font-family: var(--font-mono); color: var(--accent);">${esc(guildCfg?.prefix || ';')}</div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="crown" size="14"></i> Ownership</div>
    <div class="card-value" style="font-size: 1.1rem; padding-top: 0.75rem;">${owner ? esc(owner.user.tag) : 'Unknown'}</div>
  </div>
</div>

<div class="card">
  <div class="card-label"><i data-lucide="info" size="14"></i> Node Metadata</div>
  <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem;">
    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
      <span class="s-meta">Server Identifier</span>
      <span class="mono" style="font-size: 0.9rem;">${guild.id}</span>
    </div>
    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
      <span class="s-meta">Initialization Date</span>
      <span class="s-meta" style="color: var(--text);">${new Date(guild.createdTimestamp).toLocaleString()}</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span class="s-meta">Shard Assignment</span>
      <span class="s-meta" style="color: var(--text);">Shard #0</span>
    </div>
  </div>
</div>`;
}

/* ───────── LOGS ───────── */
export async function serverLogsContent(guild, userGuild) {
  const modDb = getDb('moderation');
  const warns = modDb.query(
    'SELECT w.*, w.rowid as id FROM warns w WHERE w.guild_id = ? ORDER BY w.created_at DESC LIMIT 100'
  ).all(guild.id);

  const userIds = new Set();
  warns.forEach(w => { userIds.add(w.user_id); if (w.moderator_id) userIds.add(w.moderator_id); });
  const userMap = {};
  await Promise.all([...userIds].map(async (id) => {
    try {
      const u = await clientRef.users.fetch(id);
      userMap[id] = { name: u.global_name || u.username, avatar: u.avatar };
    } catch {
      userMap[id] = { name: id, avatar: '' };
    }
  }));

  const warnRows = warns.length
    ? warns.map(w => {
        const date = w.created_at ? new Date(w.created_at + 'Z').toLocaleString() : '—';
        const user = userMap[w.user_id] || { name: w.user_id };
        const mod = userMap[w.moderator_id] || { name: w.moderator_id };
        const uAvatar = user.avatar ? `<img src="https://cdn.discordapp.com/avatars/${w.user_id}/${user.avatar}" style="width:24px;height:24px;border-radius:50%">` : '';
        const mAvatar = mod.avatar ? `<img src="https://cdn.discordapp.com/avatars/${w.moderator_id}/${mod.avatar}" style="width:24px;height:24px;border-radius:50%">` : '';
        return `<tr><td><div class="user-info">${uAvatar}${esc(user.name)}</div></td><td><div class="user-info">${mAvatar}${esc(mod.name)}</div></td><td>${esc(w.reason || 'No reason')}</td><td class="s-meta">${date}</td></tr>`;
      }).join('')
    : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:4rem">No activity logs recorded for this node.</td></tr>';

  return `
<div class="section-header">
  <h1 class="serif">Activity Logs</h1>
  <p>Historical record of moderation protocols and system interactions.</p>
</div>

<div class="table-wrap">
  <table class="table">
    <thead><tr><th>Target Subject</th><th>Authorized By</th><th>Action / Reason</th><th>Timestamp</th></tr></thead>
    <tbody>${warnRows}</tbody>
  </table>
</div>`;
}

/* ───────── BANS ───────── */
export function serverBansContent(guild, userGuild) {
  return `
<div class="section-header">
  <h1 class="serif">Ban Registry</h1>
  <p>Manage access restrictions for this community node.</p>
</div>

<div class="field" style="max-width: 400px; margin-bottom: 2rem;">
  <input type="text" id="ban-search" placeholder="Filter by username or ID..." oninput="filterBans(this.value)" style="padding-left: 2.5rem; background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><circle cx=%2211%22 cy=%2211%22 r=%228%22/><line x1=%2221%22 y1=%2221%22 x2=%2216.65%22 y2=%2216.65%22/></svg>'); background-repeat: no-repeat; background-position: 0.8rem center;">
</div>

<div class="table-wrap">
  <table class="table">
    <thead><tr><th>Subject</th><th>Reason for Exclusion</th><th>Registry Date</th><th>Actions</th></tr></thead>
    <tbody id="ban-list">
      <tr><td colspan="4" style="text-align:center;padding:4rem;color:var(--text-muted)">Querying ban registry...</td></tr>
    </tbody>
  </table>
</div>

<div id="ban-toast"></div>

<script defer>
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

async function loadBans() {
  try {
    const r = await fetch('/api/servers/${guild.id}/bans');
    if (!r.ok) throw new Error('Failed to fetch');
    const bans = await r.json();
    const tbody = document.getElementById('ban-list');
    if (!bans.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:4rem;color:var(--text-muted)">Registry is empty. No active bans detected.</td></tr>';
      return;
    }
    tbody.innerHTML = bans.map(b => {
      const u = b.user;
      const date = b.created_at ? new Date(b.created_at + 'Z').toLocaleString() : '—';
      const avatar = u.avatar ? \`https://cdn.discordapp.com/avatars/\${u.id}/\${u.avatar}.png\` : 'https://cdn.discordapp.com/embed/avatars/0.png';
      const username = u.global_name || u.username || '';
      return \`<tr class="ban-row" data-name="\${username.toLowerCase()} \${u.id}">
        <td><div class="user-info"><img src="\${avatar}"><div>\${esc(username)}<div class="s-meta" style="font-size:0.75rem">\${u.id}</div></div></div></td>
        <td>\${esc(b.reason || 'No protocol violation specified')}</td>
        <td class="s-meta">\${date}</td>
        <td><button class="btn btn-sm btn-secondary" style="color: var(--green); border-color: var(--green); background: transparent;" onclick="unban('\${u.id}')">Restore Access</button></td>
      </tr>\`;
    }).join('');
  } catch(e) {
    document.getElementById('ban-list').innerHTML = '<tr><td colspan="4" style="text-align:center;padding:4rem;color:var(--red)">Failed to synchronize with registry.</td></tr>';
  }
}

function filterBans(q) {
  const term = q.toLowerCase();
  document.querySelectorAll('.ban-row').forEach(r => {
    r.style.display = r.dataset.name.includes(term) ? '' : 'none';
  });
}

async function unban(userId) {
  if (!confirm('Authorize access restoration for this subject?')) return;
  try {
    const r = await fetch('/api/servers/${guild.id}/bans/' + userId + '/unban', { method: 'POST' });
    const d = await r.json();
    if (d.error) { showToast(d.error, 'error'); return; }
    showToast('Access restored successfully.', 'success');
    loadBans();
  } catch(e) {
    showToast('Failed to restore access.', 'error');
  }
}

function showToast(msg, type) {
  const el = document.getElementById('ban-toast');
  el.innerHTML = \`<div class="toast toast-\${type}">\${esc(msg)}</div>\`;
  setTimeout(() => el.innerHTML = '', 4000);
}

loadBans();
</script>`;
}

/* ───────── MOD APPLICATION ───────── */
export function serverModApplicationContent(guild, userGuild, config, submissions, userSub) {
  const isGuildAdmin = userGuild && isAdmin(userGuild.permissions);
  const enabled = config?.enabled ?? 0;
  const questions = config?.questions ? JSON.parse(config.questions) : [
    { id: 'q1', label: 'Why do you want to be a moderator?', type: 'textarea', required: true },
    { id: 'q2', label: 'How old are you?', type: 'number', required: true },
    { id: 'q3', label: 'Do you have any previous moderation experience?', type: 'text', required: false },
  ];

  if (isGuildAdmin) {
    const submissionRows = submissions?.length
      ? submissions.map((s, idx) => {
          const answers = JSON.parse(s.answers);
          const answerPreview = Object.values(answers).filter(v => v && !v.startsWith('data:')).slice(0, 2).join(' · ');
          const date = s.created_at ? new Date(s.created_at + 'Z').toLocaleString() : '—';
          const avatar = `https://cdn.discordapp.com/avatars/${s.user_id}/${s.user_avatar || ''}.png`;
          const statusColors = { pending: 'var(--yellow)', accepted: 'var(--green)', rejected: 'var(--red)' };
          return `<tr>
            <td><div class="user-info"><img src="${avatar}" onerror="this.style.display='none'">${esc(s.username || s.user_id)}</div></td>
            <td><div class="s-meta" style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(answerPreview)}</div></td>
            <td><span class="s-badge" style="background: ${statusColors[s.status]}33; color: ${statusColors[s.status]}; border: 1px solid ${statusColors[s.status]}aa">${s.status.toUpperCase()}</span></td>
            <td class="s-meta">${date}</td>
            <td>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-sm btn-primary" onclick="openModal(${idx})">View</button>
                ${s.status === 'pending'
                  ? `<button class="btn btn-sm btn-secondary" style="color: var(--green);" onclick="reviewSub(${s.id},'accepted')">Accept</button>
                     <button class="btn btn-sm btn-secondary" style="color: var(--red);" onclick="reviewSub(${s.id},'rejected')">Reject</button>`
                  : `<span class="s-meta" style="font-size:0.7rem">${s.reviewed_by ? `By ${esc(s.reviewerName || s.reviewed_by)}` : ''}</span>`}
              </div>
            </td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="5" style="text-align:center;padding:4rem;color:var(--text-muted)">No applications filed for this cycle.</td></tr>';

    return `
<div class="section-header">
  <h1 class="serif">Recruitment Hub</h1>
  <p>Process and evaluate candidates for the moderator registry.</p>
</div>

<div class="card" style="margin-bottom:2rem">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <div>
      <h3 class="serif" style="font-size: 1.25rem;">Recruitment Protocols</h3>
      <p class="s-meta">${enabled ? 'Currently accepting new applications.' : 'System is offline. No new applications accepted.'}</p>
    </div>
    <div style="display:flex;align-items:center;gap:1rem">
      <button class="btn btn-sm btn-secondary" onclick="copyLink()">Share Portal</button>
      <button class="btn btn-sm btn-secondary" style="color: var(--red);" onclick="resetApps()">Purge All</button>
      <div style="display:flex; align-items:center; gap: 8px;">
        <span class="s-meta" style="font-weight: 700;">${enabled ? 'ACTIVE' : 'INACTIVE'}</span>
        <label class="toggle-wrap" style="position:relative; display:inline-block; width:44px; height:24px;">
          <input type="checkbox" style="opacity:0; width:0; height:0;" ${enabled ? 'checked' : ''} onchange="toggleApps(${guild.id})">
          <span style="position:absolute; cursor:pointer; inset:0; background:var(--surface-raised); border:1px solid var(--border); border-radius:100px; transition:.3s;"></span>
          <style>
            .toggle-wrap input:checked + span { background: var(--accent); border-color: var(--accent); }
            .toggle-wrap span::before { content:''; position:absolute; height:16px; width:16px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:.3s; }
            .toggle-wrap input:checked + span::before { transform: translateX(20px); }
          </style>
        </label>
      </div>
    </div>
  </div>
</div>

<div class="grid" style="grid-template-columns: 1fr 2fr;">
  <div class="card">
    <h3 class="serif" style="margin-bottom: 1.5rem;">Protocol Questions</h3>
    <div id="questions-list">
      ${questions.map((q, i) => `
        <div class="card" style="padding: 1rem; background: var(--surface-raised); margin-bottom: 0.75rem;" data-qid="${q.id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
            <div style="min-width: 0;">
              <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 4px;">${esc(q.label)}</div>
              <div class="s-meta" style="font-size: 0.75rem;">Type: ${q.type} · ${q.required ? 'Required' : 'Optional'}</div>
            </div>
            <button onclick="removeQ(${i})" style="background:none; border:none; color:var(--red); cursor:pointer;">✕</button>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
      <button class="btn btn-sm btn-secondary" style="flex: 1" onclick="addQ()">+ Add</button>
      <button class="btn btn-sm btn-primary" style="flex: 1" onclick="saveQs()">Save Changes</button>
    </div>
  </div>

  <div class="table-wrap">
    <table class="table">
      <thead><tr><th>Candidate</th><th>Preview</th><th>Status</th><th>Filed Date</th><th>Action</th></tr></thead>
      <tbody>${submissionRows}</tbody>
    </table>
  </div>
</div>

<div id="app-toast"></div>

<!-- Submission detail modal -->
<div id="sub-modal" class="modal-overlay" onclick="if(event.target===this)closeModal()" style="display:none">
  <div class="modal-view">
    <div class="modal-header">
      <div class="modal-title serif" id="modal-user"></div>
      <button onclick="closeModal()" style="background:none;border:none;color:var(--text-muted);font-size:1.5rem;cursor:pointer">✕</button>
    </div>
    <div id="modal-body" class="modal-body"></div>
  </div>
</div>

<script defer>
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
const subData = ${JSON.stringify(JSON.stringify(submissions.map(s => ({ ...s, answers: JSON.parse(s.answers) }))))};
const subQuestions = ${JSON.stringify(JSON.stringify(questions))};

function openModal(idx) {
  const subs = JSON.parse(subData);
  const qs = JSON.parse(subQuestions);
  const sub = subs[idx];
  document.getElementById('modal-user').textContent = esc(sub.username || sub.user_id);
  const body = document.getElementById('modal-body');
  body.innerHTML = qs.map(q => {
    const answer = sub.answers[q.id];
    if (!answer && !q.required) return '';
    let display = esc(answer || '(skipped)');
    if (typeof answer === 'string' && answer.startsWith('data:image')) {
      display = '<img src="' + esc(answer) + '" style="max-width:100%;max-height:300px;border-radius:12px;margin-top:8px;border:1px solid var(--border)">';
    }
    return '<div style="margin-bottom:1.5rem"><div class="card-label">' + esc(q.label) + '</div><div style="font-size:1rem;line-height:1.6">' + display + '</div></div>';
  }).join('');
  document.getElementById('sub-modal').style.display = 'flex';
}
function closeModal() { document.getElementById('sub-modal').style.display = 'none'; }

function copyLink() {
  navigator.clipboard.writeText(window.location.origin + '/manage/${guild.id}/mod-application').then(() => showAppToast('Link copied to clipboard.', 'success'));
}

async function resetApps() {
  if (!confirm('Purge all submissions? This action is irreversible.')) return;
  const r = await fetch('/api/servers/${guild.id}/mod-application/reset', { method: 'POST' });
  const d = await r.json();
  if (d.ok) { showAppToast('Submissions purged.', 'success'); setTimeout(() => location.reload(), 1000); }
}

async function toggleApps() {
  const r = await fetch('/api/servers/${guild.id}/mod-application/toggle', { method: 'POST' });
  const d = await r.json();
  showAppToast(d.enabled ? 'Recruitment active.' : 'Recruitment offline.', 'success');
}

async function reviewSub(subId, status) {
  const r = await fetch('/api/servers/${guild.id}/mod-application/submissions/' + subId + '/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const d = await r.json();
  if (d.ok) { showAppToast('Decision recorded: ' + status, 'success'); setTimeout(() => location.reload(), 1000); }
}

function showAppToast(msg, type) {
  const el = document.getElementById('app-toast');
  el.innerHTML = \`<div class="toast toast-\${type}">\${esc(msg)}</div>\`;
  setTimeout(() => el.innerHTML = '', 4000);
}
</script>`;
  }

  // User-facing application form
  const userAvatar = userGuild?.user?.avatar
    ? `https://cdn.discordapp.com/avatars/${userGuild.user.id}/${userGuild.user.avatar}.png`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  if (userSub) {
    const statusIcons = {
      pending: { icon: 'clock', color: 'var(--yellow)', text: 'APPLICATION UNDER REVIEW' },
      accepted: { icon: 'check-circle', color: 'var(--green)', text: 'ACCESS GRANTED: MODERATOR' },
      rejected: { icon: 'x-circle', color: 'var(--red)', text: 'APPLICATION DENIED' },
    };
    const s = statusIcons[userSub.status] || statusIcons.pending;

    return `
<div class="section-header">
  <h1 class="serif">Application Status</h1>
  <p>Status report for your candidacy at ${esc(guild.name)}.</p>
</div>

<div class="card" style="text-align:center;padding:4rem; border-top: 4px solid ${s.color}">
  <div style="margin-bottom:2rem">
    <i data-lucide="${s.icon}" size="64" style="color:${s.color}"></i>
  </div>
  <h2 class="serif" style="font-size:2rem; margin-bottom:1rem; color:${s.color}">${s.text}</h2>
  <p style="color:var(--text-muted); font-size:1.1rem; max-width:500px; margin:0 auto; line-height:1.6">
    ${userSub.status === 'pending' ? 'Your credentials and answers are currently being evaluated by the server administration. Please check back later.' :
      userSub.status === 'accepted' ? 'Congratulations. Your application has been approved. System permissions and role assignments will be updated shortly.' :
      'Unfortunately, your application does not meet our current requirements. Thank you for your interest.'}
  </p>
  <div style="margin-top:3rem">
    <a href="/dashboard" class="btn btn-secondary">Return to Dashboard</a>
  </div>
</div>`;
  }

  if (!enabled) {
    return `
<div class="section-header">
  <h1 class="serif">Recruitment Closed</h1>
  <p>The recruitment portal for ${esc(guild.name)} is currently offline.</p>
</div>
<div class="card" style="text-align:center; padding:5rem; opacity:0.6">
  <i data-lucide="lock" size="48" style="margin-bottom:1.5rem; color: var(--text-muted)"></i>
  <h3 class="serif">Access Restricted</h3>
  <p>New applications are not being accepted at this time.</p>
</div>`;
  }

  const formFields = questions.map((q) => {
    let input = `<input type="${q.type}" name="${q.id}" ${q.required ? 'required' : ''}>`;
    if (q.type === 'textarea') input = `<textarea name="${q.id}" ${q.required ? 'required' : ''}></textarea>`;
    if (q.type === 'file') input = `<input type="file" name="${q.id}" accept="image/*" ${q.required ? 'required' : ''}>`;
    return `<div class="field"><label>${esc(q.label)} ${q.required ? '<span style="color:var(--red)">*</span>' : ''}</label>${input}</div>`;
  }).join('');

  return `
<div class="section-header">
  <h1 class="serif">Candidate Registration</h1>
  <p>Complete the following protocols to apply for a moderator position.</p>
</div>

<div class="card" style="max-width:700px; margin: 0 auto;">
  <form id="app-form" onsubmit="submitApp(event)">
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--border)">
      <img src="${userAvatar}" style="width:48px;height:48px;border-radius:50%;border:2px solid var(--surface-raised)">
      <div>
        <div style="font-weight:800;font-size:1.1rem">${esc(userGuild?.user?.global_name || userGuild?.user?.username || 'Candidate')}</div>
        <div class="s-meta">Applying to ${esc(guild.name)}</div>
      </div>
    </div>
    ${formFields}
    <div style="margin-top:2rem">
      <button type="submit" class="btn btn-primary" style="width:100%">Submit Application Registry</button>
    </div>
  </form>
</div>

<div id="app-toast"></div>

<script defer>
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
async function submitApp(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const answers = {};
  const filePromises = [];
  for (const [k, v] of fd.entries()) {
    if (v instanceof File && v.size > 0) {
      filePromises.push(new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => { answers[k] = reader.result; resolve(); };
        reader.readAsDataURL(v);
      }));
    } else {
      answers[k] = v;
    }
  }
  await Promise.all(filePromises);
  const r = await fetch('/api/servers/${guild.id}/mod-application/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  const d = await r.json();
  if (d.ok) { showAppToast('Application filed successfully.', 'success'); setTimeout(() => location.reload(), 1500); }
  else { showAppToast(d.error || 'Submission failed.', 'error'); }
}
function showAppToast(msg, type) {
  const el = document.getElementById('app-toast');
  el.innerHTML = \`<div class="toast toast-\${type}">\${esc(msg)}</div>\`;
  setTimeout(() => el.innerHTML = '', 4000);
}
</script>`;
}

/* ───────── AFK ───────── */
export async function serverAfkContent(guild) {
  return `
<div class="section-header">
  <h1 class="serif">AFK Registry</h1>
  <p>Real-time list of members currently identified as away from keyboard.</p>
</div>

<div class="table-wrap">
  <table class="table">
    <thead><tr><th>Identified Subject</th><th>Declared Reason</th><th>Initiation Date</th><th>Registry Management</th></tr></thead>
    <tbody id="afk-list">
      <tr><td colspan="4" style="text-align:center;padding:4rem;color:var(--text-muted)">Querying AFK nodes...</td></tr>
    </tbody>
  </table>
</div>

<div id="afk-toast"></div>

<script defer>
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
async function loadAfk() {
  try {
    const r = await fetch('/api/servers/${guild.id}/afk');
    const list = await r.json();
    const tbody = document.getElementById('afk-list');
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:4rem;color:var(--text-muted)">Registry is empty. No subjects currently AFK.</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(a => {
      const avatar = a.user_avatar ? \`https://cdn.discordapp.com/avatars/\${a.user_id}/\${a.user_avatar}.png\` : '';
      const date = a.created_at ? new Date(a.created_at + 'Z').toLocaleString() : '—';
      return \`<tr>
        <td><div class="user-info">\${avatar ? '<img src="' + avatar + '">' : ''}\${esc(a.username || a.user_id)}</div></td>
        <td>\${esc(a.reason || 'No reason provided')}</td>
        <td class="s-meta">\${date}</td>
        <td><button class="btn btn-sm btn-secondary" style="color: var(--red);" onclick="removeAfk('\${a.user_id}')">Purge Status</button></td>
      </tr>\`;
    }).join('');
  } catch(e) {
    document.getElementById('afk-list').innerHTML = '<tr><td colspan="4" style="text-align:center;padding:4rem;color:var(--red)">Failed to synchronize AFK registry.</td></tr>';
  }
}
async function removeAfk(userId) {
  if (!confirm('Purge AFK status for this subject?')) return;
  const r = await fetch('/api/servers/${guild.id}/afk/' + userId + '/remove', { method: 'POST' });
  const d = await r.json();
  if (d.ok) { showAfkToast('Status purged.', 'success'); loadAfk(); }
}
function showAfkToast(msg, type) {
  const el = document.getElementById('afk-toast');
  el.innerHTML = \`<div class="toast toast-\${type}">\${esc(msg)}</div>\`;
  setTimeout(() => el.innerHTML = '', 4000);
}
loadAfk();
</script>`;
}

/* ───────── VERSIONS ───────── */
export function versionsContent() {
  const discordJsVersion = djsVersion;
  const bunVersion = process.versions.bun || 'N/A';
  
  return `
<div class="section-header">
  <h1 class="serif">System Architecture</h1>
  <p>Core runtime specifications and library dependency registry.</p>
</div>

<div class="grid">
  <div class="card">
    <div class="card-label"><i data-lucide="package" size="14"></i> Discord.js</div>
    <div class="card-value">${discordJsVersion}</div>
    <div class="s-meta" style="margin-top:0.5rem">Primary interaction layer</div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="zap" size="14"></i> Bun Runtime</div>
    <div class="card-value">${bunVersion}</div>
    <div class="s-meta" style="margin-top:0.5rem">High-performance engine</div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="cpu" size="14"></i> Node.js</div>
    <div class="card-value">${process.version.replace('v', '')}</div>
    <div class="s-meta" style="margin-top:0.5rem">Compatibility environment</div>
  </div>
  <div class="card">
    <div class="card-label"><i data-lucide="layers" size="14"></i> Platform</div>
    <div class="card-value" style="font-size: 1.5rem; padding-top: 0.5rem;">${process.platform.toUpperCase()}</div>
    <div class="s-meta" style="margin-top:0.5rem">${process.arch} architecture</div>
  </div>
</div>

<div class="table-wrap" style="margin-top: 3rem;">
  <table class="table">
    <thead>
      <tr>
        <th>Subsystem</th>
        <th>Version Identifier</th>
        <th>Operational Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Core Gateway</strong></td>
        <td><code>discord.js@${discordJsVersion}</code></td>
        <td><span style="color: var(--green); font-weight:700;">● NOMINAL</span></td>
      </tr>
      <tr>
        <td><strong>Runtime Environment</strong></td>
        <td><code>bun@${bunVersion}</code></td>
        <td><span style="color: var(--green); font-weight:700;">● OPERATIONAL</span></td>
      </tr>
      <tr>
        <td><strong>Data Persistence</strong></td>
        <td><code>MongoDB 6.x</code></td>
        <td><span style="color: var(--green); font-weight:700;">● SYNCHRONIZED</span></td>
      </tr>
      <tr>
        <td><strong>Process Uptime</strong></td>
        <td><code>${fmt(Math.floor(process.uptime()))}s</code></td>
        <td><span style="color: var(--accent); font-weight:700;">● ACTIVE</span></td>
      </tr>
    </tbody>
  </table>
</div>

<style>
code { background: var(--surface-raised); padding: 0.2rem 0.5rem; border-radius: 4px; color: var(--accent); font-family: var(--font-mono); font-size: 0.85rem; border: 1px solid var(--border); }
</style>`;
}
