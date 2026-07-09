import { esc } from './helpers.js';

export function layout(page, content, opts = {}) {
  const { user, server, serverPage, canManage } = opts;
  const on = p => page === p ? 'active' : '';
  const serverOn = p => serverPage === p ? 'active' : '';

  const userArea = user
    ? `<div class="nav-user-group">
         <a href="/dashboard" class="nav-user" title="Dashboard">
          <img src="${esc(user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png')}" class="nav-avatar">
          <span class="nav-user-name">${esc(user.global_name || user.username)}</span>
         </a>
         <a href="/logout" class="nav-logout" title="Logout"><i data-lucide="log-out" size="16"></i></a>
       </div>`
    : `<a href="/login" class="nav-btn-login">Login</a>`;

  const mgmtLinks = canManage ? `
  <div class="ss-section-label">Management</div>
  <a href="/manage/${server.id}/overview" class="ss-link ${serverOn('overview')}">
    <i data-lucide="layout-grid" size="18"></i>
    <span>Overview</span>
  </a>
  <a href="/manage/${server.id}/logs" class="ss-link ${serverOn('logs')}">
    <i data-lucide="scroll-text" size="18"></i>
    <span>Activity Logs</span>
  </a>
  <a href="/manage/${server.id}/bans" class="ss-link ${serverOn('bans')}">
    <i data-lucide="user-minus" size="18"></i>
    <span>Ban List</span>
  </a>
  <a href="/manage/${server.id}/afk" class="ss-link ${serverOn('afk')}">
    <i data-lucide="coffee" size="18"></i>
    <span>AFK Registry</span>
  </a>` : '';

  const serverSidebar = server ? `
<aside class="server-sidebar">
  <div class="ss-header">
    ${server.icon ? `<img src="${server.icon}" class="ss-icon">` : `<div class="ss-icon-none">${server.name[0]}</div>`}
    <div class="ss-info">
      <div class="ss-name">${esc(server.name)}</div>
      <div class="ss-status">Connected</div>
    </div>
  </div>
  <nav class="ss-nav">
    ${mgmtLinks}
    <div class="ss-section-label">Recruitment</div>
    <a href="/manage/${server.id}/mod-application" class="ss-link ${serverOn('mod-application')}">
      <i data-lucide="file-signature" size="18"></i>
      <span>Applications</span>
    </a>
  </nav>
</aside>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Neonix | Control Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@latest"></script>
<style>
:root { 
  --bg: #050505; 
  --surface: #0d0d0d; 
  --surface-raised: #141414;
  --border: #1f1f1f; 
  --accent: #6366f1; /* Indigo */
  --accent-soft: rgba(99, 102, 241, 0.1);
  --accent-glow: rgba(99, 102, 241, 0.4);
  --text: #f8fafc; 
  --text-muted: #94a3b8; 
  --red: #ef4444; 
  --green: #10b981; 
  --yellow: #f59e0b;
  --font-main: 'Plus Jakarta Sans', sans-serif;
  --font-serif: 'Fraunces', serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius: 16px;
  --radius-sm: 10px;
  --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

* { margin:0; padding:0; box-sizing:border-box; outline: none; }
body { 
  background: var(--bg); 
  color: var(--text); 
  font-family: var(--font-main); 
  line-height: 1.6; 
  min-height: 100vh; 
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #333; }

/* Navigation */
header.top-nav { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0 2rem; 
  height: 72px;
  background: rgba(5, 5, 5, 0.8); 
  backdrop-filter: blur(16px); 
  border-bottom: 1px solid var(--border); 
  position: sticky; 
  top: 0; 
  z-index: 1000; 
}
.nav-left { display: flex; align-items: center; gap: 2.5rem; }
.brand { 
  font-family: var(--font-serif); 
  font-size: 1.5rem; 
  font-weight: 700; 
  text-decoration: none; 
  color: var(--text); 
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.brand span { color: var(--accent); }
.nav-links { display: flex; gap: 1rem; }
.nav-link { 
  color: var(--text-muted); 
  text-decoration: none; 
  font-size: 0.875rem; 
  font-weight: 600; 
  padding: 0.5rem 1rem; 
  border-radius: var(--radius-sm); 
  transition: var(--transition); 
}
.nav-link:hover { color: var(--text); background: var(--surface); }
.nav-link.active { color: var(--accent); background: var(--accent-soft); }

.nav-right { display: flex; align-items: center; gap: 1rem; }
.nav-user-group { display: flex; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 100px; padding: 4px; padding-right: 12px; gap: 8px; }
.nav-user { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: var(--text); padding-right: 4px; }
.nav-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border); }
.nav-user-name { font-size: 0.875rem; font-weight: 600; }
.nav-logout { color: var(--text-muted); display: flex; align-items: center; transition: var(--transition); }
.nav-logout:hover { color: var(--red); }
.nav-btn-login { 
  background: var(--accent); 
  color: white; 
  text-decoration: none; 
  padding: 0.6rem 1.5rem; 
  border-radius: 100px; 
  font-size: 0.875rem; 
  font-weight: 700; 
  transition: var(--transition); 
}
.nav-btn-login:hover { transform: translateY(-1px); box-shadow: 0 4px 20px var(--accent-glow); }

/* Layout Wrapper */
.main-wrapper { display: flex; min-height: calc(100vh - 72px); }

/* Sidebar */
.server-sidebar { 
  width: 280px; 
  background: var(--surface); 
  border-right: 1px solid var(--border); 
  display: flex; 
  flex-direction: column; 
  padding: 1.5rem 1rem; 
  position: sticky;
  top: 72px;
  height: calc(100vh - 72px);
  overflow-y: auto;
}
.ss-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; padding: 0.5rem; }
.ss-icon { width: 48px; height: 48px; border-radius: var(--radius-sm); }
.ss-icon-none { 
  width: 48px; height: 48px; border-radius: var(--radius-sm); 
  background: var(--surface-raised); border: 1px solid var(--border); 
  display: flex; align-items: center; justify-content: center; 
  font-weight: 800; color: var(--accent); font-size: 1.25rem; 
}
.ss-name { font-weight: 700; font-size: 1rem; letter-spacing: -0.01em; margin-bottom: 2px; }
.ss-status { font-size: 0.75rem; color: var(--green); display: flex; align-items: center; gap: 4px; font-weight: 600; }
.ss-status::before { content: ''; width: 6px; height: 6px; background: var(--green); border-radius: 50%; display: inline-block; }

.ss-section-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin: 1.5rem 0.5rem 0.75rem 0.5rem; }
.ss-link { 
  display: flex; align-items: center; gap: 0.75rem; 
  padding: 0.75rem 1rem; border-radius: var(--radius-sm); 
  color: var(--text-muted); text-decoration: none; 
  font-size: 0.9rem; font-weight: 600; transition: var(--transition);
  margin-bottom: 4px;
}
.ss-link i { opacity: 0.7; }
.ss-link:hover { background: var(--surface-raised); color: var(--text); }
.ss-link.active { background: var(--accent-soft); color: var(--accent); }
.ss-link.active i { opacity: 1; }

/* Main Content Area */
.content { flex: 1; padding: 3rem; max-width: 1400px; margin: 0 auto; width: 100%; }

/* Typography Extras */
h1, h2, h3 { font-family: var(--font-serif); letter-spacing: -0.02em; }
.serif { font-family: var(--font-serif); }
.mono { font-family: var(--font-mono); }

/* Hero Section */
.hero { text-align: center; padding: 6rem 1rem; margin-bottom: 4rem; position: relative; }
.hero-bg { 
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
  width: 100%; height: 100%; background: radial-gradient(circle, var(--accent-soft) 0%, transparent 70%); 
  z-index: -1; pointer-events: none; opacity: 0.5;
}
.bot-avatar { 
  width: 140px; height: 140px; border-radius: 32px; 
  border: 4px solid var(--surface); box-shadow: 0 20px 40px rgba(0,0,0,0.4); 
  margin-bottom: 2.5rem; transition: var(--transition);
}
.bot-avatar:hover { transform: translateY(-8px) rotate(3deg); }
.hero h1 { font-size: 5rem; font-weight: 700; margin-bottom: 1rem; line-height: 1; }
.hero p { font-size: 1.125rem; color: var(--text-muted); max-width: 600px; margin: 0 auto 3rem auto; }
.btn-cta { 
  display: inline-flex; align-items: center; gap: 0.75rem; 
  background: var(--text); color: var(--bg); 
  padding: 1rem 2.5rem; border-radius: 100px; 
  font-weight: 800; text-decoration: none; font-size: 1rem; 
  transition: var(--transition); box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.btn-cta:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(0,0,0,0.3); background: #fff; }

/* Grid & Cards */
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
.card { 
  background: var(--surface); border: 1px solid var(--border); 
  padding: 2rem; border-radius: var(--radius); 
  transition: var(--transition); position: relative; overflow: hidden;
}
.card:hover { border-color: #333; transform: translateY(-4px); background: var(--surface-raised); }
.card-label { 
  display: flex; align-items: center; gap: 0.5rem; 
  font-size: 0.75rem; font-weight: 800; text-transform: uppercase; 
  color: var(--text-muted); margin-bottom: 1rem; letter-spacing: 0.05em;
}
.card-value { font-family: var(--font-serif); font-size: 2.5rem; font-weight: 700; color: var(--text); line-height: 1; }
.card-value span { font-size: 1rem; font-family: var(--font-main); color: var(--accent); margin-left: 4px; font-weight: 600; }

/* Charts */
.chart-container { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 2rem; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.chart-title { font-family: var(--font-serif); font-size: 1.25rem; font-weight: 700; }
.chart-canvas { height: 320px; }

/* Section Header */
.section-header { margin-bottom: 3rem; }
.section-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
.section-header p { color: var(--text-muted); font-size: 1.1rem; }

/* Server Grid */
.server-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
.server-card { 
  display: flex; align-items: center; gap: 1.25rem; 
  background: var(--surface); border: 1px solid var(--border); 
  padding: 1.5rem; border-radius: var(--radius); 
  text-decoration: none; color: inherit; transition: var(--transition);
}
.server-card:hover { border-color: var(--accent); background: var(--surface-raised); transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.s-icon { width: 64px; height: 64px; border-radius: var(--radius-sm); object-fit: cover; }
.s-icon-none { 
  width: 64px; height: 64px; border-radius: var(--radius-sm); 
  background: var(--surface-raised); border: 1px solid var(--border); 
  display: flex; align-items: center; justify-content: center; 
  font-weight: 800; color: var(--accent); font-size: 1.5rem;
}
.s-body { flex: 1; min-width: 0; }
.s-name { font-weight: 700; font-size: 1.1rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.s-meta { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
.s-badge { 
  display: inline-flex; align-items: center; gap: 4px; 
  padding: 2px 10px; border-radius: 100px; 
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase; 
  margin-top: 8px;
}
.s-badge.owner { background: #fef3c7; color: #92400e; }
.s-badge.admin { background: #dbeafe; color: #1e40af; }
.s-badge.mod { background: #d1fae5; color: #065f46; }

.s-action { 
  padding: 0.5rem 1rem; border-radius: 100px; 
  font-size: 0.75rem; font-weight: 800; letter-spacing: 0.02em; 
  transition: var(--transition); 
}
.s-action.manage { background: var(--accent); color: white; }
.s-action.apply { border: 1px solid var(--accent); color: var(--accent); }
.s-action.pending { background: var(--surface-raised); color: var(--yellow); border: 1px solid var(--yellow); }

/* Tables */
.table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.table th { text-align: left; padding: 1.25rem 1.5rem; background: var(--surface-raised); font-weight: 700; color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
.table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
.table tr:last-child td { border-bottom: none; }
.table tr:hover td { background: var(--surface-raised); }
.user-info { display: flex; align-items: center; gap: 0.75rem; font-weight: 600; }
.user-info img { width: 32px; height: 32px; border-radius: 50%; }

/* Buttons */
.btn { 
  display: inline-flex; align-items: center; gap: 0.5rem; 
  padding: 0.75rem 1.5rem; border-radius: var(--radius-sm); 
  font-size: 0.875rem; font-weight: 700; cursor: pointer; 
  transition: var(--transition); border: 1px solid transparent; 
  text-decoration: none; justify-content: center;
}
.btn-primary { background: var(--accent); color: white; }
.btn-primary:hover { background: #4f46e5; box-shadow: 0 4px 15px var(--accent-glow); }
.btn-secondary { background: var(--surface-raised); border: 1px solid var(--border); color: var(--text); }
.btn-secondary:hover { border-color: #444; background: #222; }
.btn-danger { background: var(--red); color: white; }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.75rem; border-radius: 8px; }

/* Alerts */
.alert { padding: 1.25rem 1.5rem; border-radius: var(--radius); margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem; font-weight: 500; }
.alert-info { background: #1e3a8a33; border: 1px solid #1e3a8a; color: #93c5fd; }
.alert-error { background: #7f1d1d33; border: 1px solid #7f1d1d; color: #fca5a5; }

/* Forms */
.field { margin-bottom: 1.5rem; }
.field label { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted); }
.field input, .field textarea, .field select { 
  width: 100%; background: var(--surface-raised); border: 1px solid var(--border); 
  padding: 0.8rem 1rem; color: var(--text); border-radius: var(--radius-sm); 
  font-family: inherit; font-size: 1rem; transition: var(--transition);
}
.field input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }

/* Modal */
.modal-overlay { 
  position: fixed; inset: 0; background: rgba(0,0,0,0.8); 
  backdrop-filter: blur(8px); z-index: 2000; 
  display: flex; align-items: center; justify-content: center; padding: 2rem;
}
.modal-view { 
  background: var(--surface); border: 1px solid var(--border); 
  width: 100%; max-width: 600px; border-radius: 24px; 
  max-height: 90vh; overflow-y: auto; box-shadow: 0 30px 60px rgba(0,0,0,0.5);
}
.modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.modal-title { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 700; }
.modal-body { padding: 2rem; }

/* Mobile */
@media (max-width: 1024px) {
  .server-sidebar { width: 80px; padding: 1.5rem 0.5rem; }
  .ss-name, .ss-status, .ss-section-label, .ss-link span { display: none; }
  .ss-link { justify-content: center; padding: 0.75rem 0; }
  .ss-header { justify-content: center; padding: 0; }
}

@media (max-width: 768px) {
  header.top-nav { padding: 0 1rem; }
  .nav-links { display: none; }
  .content { padding: 1.5rem; }
  .hero h1 { font-size: 3rem; }
  .grid { grid-template-columns: 1fr; }
}
</style>
</head>
<body>

<header class="top-nav">
  <div class="nav-left">
    <a href="/" class="brand">NEON<span>IX</span></a>
    <nav class="nav-links">
      <a href="/" class="nav-link ${on('home')}">Overview</a>
      <a href="/servers" class="nav-link ${on('servers')}">Servers</a>
      <a href="/commands" class="nav-link ${on('commands')}">Commands</a>
    </nav>
  </div>
  <div class="nav-right">${userArea}</div>
</header>

<div class="main-wrapper">
  ${serverSidebar}
  <main class="content">${content}</main>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});
</script>
</body>
</html>`;
}
