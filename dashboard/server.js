import { json, html, redirect, getCookie, setCookie, esc, fmt, canManage, isAdmin } from './helpers.js';
import { layout } from './layout.js';
import { handleStats, setClient as setApiClient } from './api.js';
import {
  setClient as setPagesClient,
  homeContent, serversContent, commandsContent,
  userDashboardContent, serverOverviewContent,
  serverLogsContent, serverBansContent,
  serverModApplicationContent, serverAfkContent,
} from './pages.js';
import { getSession, createSession, destroySession, loadSessions, getOAuthURL, exchangeCode, fetchUser, fetchGuilds } from './auth.js';
import { initTables, getAppConfig, toggleAppEnabled, setAppQuestions, getSubmissions, getUserSubmission, addSubmission, reviewSubmission, clearSubmissions } from './db.js';
import { getDb } from '../database/index.js';
import botConfig from '../util/config.js';
import log from '../util/console.js';

let clientRef = null;
const PORT = parseInt(process.env.PORT || process.env.DASHBOARD_PORT || '5000');
const HOST = '0.0.0.0';

export function start(client) {
  clientRef = client;
  setApiClient(client);
  setPagesClient(client);
  initTables();
  loadSessions();
  Bun.serve({ port: PORT, hostname: HOST, fetch: handle });
  log.dash(`Dashboard running on port ${PORT}`);
}

function getAuth(req) {
  const sid = getCookie(req, 'neonix_session');
  const session = getSession(sid);
  return session ? session.user : null;
}

function requireAuth(req) {
  const sid = getCookie(req, 'neonix_session');
  return getSession(sid);
}

function getGuild(id) {
  return clientRef?.guilds?.cache?.get(id) || null;
}

function getManageableGuilds(session) {
  if (!session?.guilds) return [];
  const botGuilds = clientRef?.guilds?.cache;
  if (!botGuilds) return [];
  return session.guilds.filter(g => {
    if (!botGuilds.has(g.id)) return false;
    const perms = BigInt(g.permissions);
    return (perms & 0x8n) || (perms & 0x20n) || (perms & 0x4n) || (perms & 0x2n);
  });
}

function getMutualGuilds(session) {
  if (!session?.guilds) return [];
  const botGuilds = clientRef?.guilds?.cache;
  if (!botGuilds) return [];
  return session.guilds.filter(g => botGuilds.has(g.id));
}

function findUserGuild(session, guildId) {
  return session?.guilds?.find(g => g.id === guildId) || null;
}

function getRedirectUri(_req) {
  const base = botConfig.dashboardUrl;
  return `${base}/api/auth/callback`;
}

async function handle(req) {
  try {
    const url = new URL(req.url);
    const method = req.method;
    const path = url.pathname;
    const parts = path.split('/').filter(Boolean);

    if (path === '/login') {
      const redirectUri = getRedirectUri(req);
      return redirect(getOAuthURL(redirectUri));
    }

    if (path === '/api/auth/callback') {
      return await handleAuthCallback(req, url);
    }

    if (path === '/logout') {
      const sid = getCookie(req, 'neonix_session');
      if (sid) destroySession(sid);
      const res = redirect('/');
      res.headers.append('Set-Cookie', 'neonix_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
      return res;
    }

    if (path === '/api/stats') return json(handleStats());
    if (path === '/') return html(layout('home', homeContent(), { user: getAuth(req) }));
    if (path === '/servers') return html(layout('servers', serversContent(), { user: getAuth(req) }));
    if (path === '/commands') return html(layout('commands', commandsContent(), { user: getAuth(req) }));

    if (path === '/dashboard') {
      const session = requireAuth(req);
      if (!session) return redirect('/login');
      const mutualGuilds = getMutualGuilds(session);
      const enriched = mutualGuilds.map(g => {
        const appConfig = getAppConfig(g.id);
        const userSub = getUserSubmission(g.id, session.userId);
        return {
          guild: g,
          canManage: canManage(g.permissions),
          hasOpenApps: appConfig?.enabled === 1,
          hasPendingApp: userSub?.status === 'pending',
        };
      });
      return html(layout('dashboard', userDashboardContent(session.user, enriched), { user: session.user }));
    }

    if (path === '/api/servers' && method === 'GET') {
      const session = requireAuth(req);
      if (!session) return json({ error: 'Unauthorized' }, 401);
      return json(getManageableGuilds(session));
    }

    if (parts[0] === 'api' && parts[1] === 'servers' && parts[2]) {
      const session = requireAuth(req);
      if (!session) return json({ error: 'Unauthorized' }, 401);

      const guildId = parts[2];
      const guild = getGuild(guildId);
      if (!guild) return json({ error: 'Bot is not in this server' }, 404);

      const userGuild = findUserGuild(session, guildId);
      if (!userGuild) return json({ error: 'You are not a member of this server' }, 403);

      if (parts[3] === 'bans' && method === 'GET') {
        const search = url.searchParams.get('q') || '';
        return await handleGetBans(guildId, search);
      }

      if (parts[3] === 'bans' && parts[4] && parts[5] === 'unban' && method === 'POST') {
        return await handleUnban(guildId, parts[4]);
      }

      if (parts[3] === 'logs' && method === 'GET') {
        return handleGetLogs(guildId);
      }

      if (parts[3] === 'mod-application') {
        if (parts[4] === 'toggle' && method === 'POST') {
          const enabled = toggleAppEnabled(guildId);
          return json({ enabled });
        }
        if (parts[4] === 'questions' && method === 'POST') {
          if (!isAdmin(userGuild.permissions)) return json({ error: 'Only admins can manage questions' }, 403);
          const body = await req.json().catch(() => ({}));
          if (!body.questions || !Array.isArray(body.questions)) return json({ error: 'Invalid questions' }, 400);
          setAppQuestions(guildId, body.questions);
          return json({ ok: true });
        }
        if (parts[4] === 'apply' && method === 'POST') {
          return await handleApply(guildId, session, req);
        }
        if (parts[4] === 'reset' && method === 'POST') {
          if (!isAdmin(userGuild.permissions)) return json({ error: 'Only admins can reset submissions' }, 403);
          clearSubmissions(guildId);
          return json({ ok: true });
        }
        if (parts[4] === 'submissions') {
          if (method === 'GET') {
            return json(getSubmissions(guildId));
          }
          if (parts[5] && parts[6] === 'review' && method === 'POST') {
            if (!isAdmin(userGuild.permissions)) return json({ error: 'Only admins can review applications' }, 403);
            return await handleReview(guildId, parts[5], session, req);
          }
        }
      }

      if (parts[3] === 'afk') {
        if (method === 'GET') {
          return await handleGetAfk(guildId);
        }
        if (parts[4] && parts[5] === 'remove' && method === 'POST') {
          return await handleRemoveAfk(guildId, parts[4]);
        }
      }

      return json({ error: 'Not found' }, 404);
    }

    if (parts[0] === 'manage' && parts[1]) {
      return await handleManagePage(req, parts);
    }

    return new Response('Not found', { status: 404 });
  } catch (err) {
    log.error('Dashboard route error:', err);
    return json({ error: 'Internal server error' }, 500);
  }
}

async function handleAuthCallback(req, url) {
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  if (error) return html(`<h1>Authorization failed: ${esc(error)}</h1>`);
  if (!code) return html('<h1>Missing authorization code</h1>');

  try {
    const redirectUri = getRedirectUri(req);
    const tokenData = await exchangeCode(code, redirectUri);
    const user = await fetchUser(tokenData.access_token);
    const guilds = await fetchGuilds(tokenData.access_token);
    const sessionId = createSession(user.id, tokenData.access_token, user, guilds);

    const res = redirect('/dashboard');
    res.headers.append('Set-Cookie', setCookie('neonix_session', sessionId));
    return res;
  } catch (err) {
    log.error('OAuth error:', err);
    return html(`<h1>Authentication failed</h1><p>${esc(err.message)}</p>`);
  }
}

async function handleManagePage(req, parts) {
  const session = requireAuth(req);
  if (!session) return redirect('/login');

  const guildId = parts[1];
  const subPage = parts[2] || 'overview';
  const guild = getGuild(guildId);

  if (!guild) {
    return html(layout('manage', `
      <div class="section-head"><h1>Server Not Found</h1></div>
      <div class="alert alert-error">The bot is not in this server, or the server does not exist.</div>
    `, { user: session.user }));
  }

  const userGuild = findUserGuild(session, guildId);
  if (!userGuild) {
    return html(layout('manage', `
      <div class="section-head"><h1>Access Denied</h1></div>
      <div class="alert alert-error">You are not a member of this server.</div>
    `, { user: session.user }));
  }

  const isManager = canManage(userGuild.permissions);
  const server = {
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL({ size: 64 }),
    memberCount: guild.memberCount,
  };

  const noAccess = () => html(layout('manage', `
    <div class="section-head"><h1>Access Denied</h1></div>
    <div class="alert alert-error">You do not have permission to manage this server.</div>
  `, { user: session.user, server, canManage: false }));
  const layoutOpts = (sp) => ({ user: session.user, server, serverPage: sp, canManage: isManager });

  switch (subPage) {
    case 'mod-application': {
      const config = getAppConfig(guildId);
      const rawSubmissions = isManager ? getSubmissions(guildId) : [];
      const submissions = await Promise.all(rawSubmissions.map(async (s) => {
        let username = s.user_id;
        let avatar = '';
        let reviewerName = '';
        try {
          const u = await clientRef.users.fetch(s.user_id);
          username = u.global_name || u.username;
          avatar = u.avatar;
        } catch {}
        if (s.reviewed_by) {
          try {
            const r = await clientRef.users.fetch(s.reviewed_by);
            reviewerName = r.global_name || r.username;
          } catch { reviewerName = s.reviewed_by; }
        }
        return { ...s, username, user_avatar: avatar, reviewerName };
      }));
      const userSub = getUserSubmission(guildId, session.userId);
      if (userSub) {
        let username = userSub.user_id;
        let avatar = '';
        try {
          const u = await clientRef.users.fetch(userSub.user_id);
          username = u.global_name || u.username;
          avatar = u.avatar;
        } catch {}
        userSub.username = username;
        userSub.user_avatar = avatar;
      }
      const content = serverModApplicationContent(guild, userGuild, config, submissions, userSub);
      return html(layout('manage', content, layoutOpts('mod-application')));
    }
    case 'overview': {
      if (!isManager) return noAccess();
      const content = serverOverviewContent(guild, userGuild);
      return html(layout('manage', content, layoutOpts('overview')));
    }
    case 'logs': {
      if (!isManager) return noAccess();
      const content = await serverLogsContent(guild, userGuild);
      return html(layout('manage', content, layoutOpts('logs')));
    }
    case 'bans': {
      if (!isManager) return noAccess();
      const content = serverBansContent(guild, userGuild);
      return html(layout('manage', content, layoutOpts('bans')));
    }
    case 'afk': {
      if (!isManager) return noAccess();
      const content = await serverAfkContent(guild);
      return html(layout('manage', content, layoutOpts('afk')));
    }
    default:
      return redirect(`/manage/${guildId}/overview`);
  }
}

async function handleGetBans(guildId, search) {
  try {
    const guild = getGuild(guildId);
    if (!guild) return json({ error: 'Server not found' }, 404);
    const bans = await guild.bans.fetch();
    const list = bans.map(b => ({
      user: { id: b.user.id, username: b.user.username, global_name: b.user.global_name, avatar: b.user.avatar },
      reason: b.reason,
      created_at: b.createdAt?.toISOString() || null,
      banned_by: null,
    }));
    if (search) {
      const q = search.toLowerCase();
      return json(list.filter(b =>
        (b.user.global_name || '').toLowerCase().includes(q) ||
        b.user.username.toLowerCase().includes(q) ||
        b.user.id.includes(q)
      ));
    }
    return json(list);
  } catch (err) {
    log.error('Fetch bans error:', err);
    return json({ error: 'Failed to fetch bans: ' + err.message }, 500);
  }
}

async function handleUnban(guildId, userId) {
  try {
    const guild = getGuild(guildId);
    if (!guild) return json({ error: 'Server not found' }, 404);
    const ban = await guild.bans.fetch(userId).catch(() => null);
    if (!ban) return json({ error: 'User is not banned' }, 404);
    await guild.members.unban(userId, 'Unbanned via dashboard');
    return json({ ok: true });
  } catch (err) {
    log.error('Unban error:', err);
    return json({ error: 'Failed to unban: ' + err.message }, 500);
  }
}

function handleGetLogs(guildId) {
  const modDb = getDb('moderation');
  const warns = modDb.query(
    'SELECT w.*, w.rowid as id FROM warns w WHERE w.guild_id = ? ORDER BY w.created_at DESC LIMIT 100'
  ).all(guildId);
  return json(warns);
}

async function handleGetAfk(guildId) {
  try {
    const afkDb = getDb('afk');
    afkDb.run(`CREATE TABLE IF NOT EXISTS afk_users (
      user_id TEXT NOT NULL, guild_id TEXT, reason TEXT NOT NULL DEFAULT 'AFK',
      scope TEXT NOT NULL DEFAULT 'server', created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, guild_id)
    )`);
    const rows = afkDb.query(
      "SELECT * FROM afk_users WHERE guild_id = ? ORDER BY created_at DESC LIMIT 100"
    ).all(guildId);
    const enriched = await Promise.all(rows.map(async (r) => {
      let name = r.user_id;
      let avatar = '';
      try {
        const u = await clientRef.users.fetch(r.user_id);
        name = u.global_name || u.username;
        avatar = u.avatar;
      } catch {}
      return { ...r, username: name, user_avatar: avatar };
    }));
    return json(enriched);
  } catch (err) {
    log.error('Fetch AFK error:', err);
    return json({ error: 'Failed to fetch AFK users' }, 500);
  }
}

async function handleRemoveAfk(guildId, userId) {
  try {
    const afkDb = getDb('afk');
    afkDb.run('DELETE FROM afk_users WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
    return json({ ok: true });
  } catch (err) {
    log.error('Remove AFK error:', err);
    return json({ error: 'Failed to remove AFK' }, 500);
  }
}

async function handleApply(guildId, session, req) {
  try {
    const config = getAppConfig(guildId);
    if (!config?.enabled) return json({ error: 'Applications are closed' }, 400);
    const existing = getUserSubmission(guildId, session.userId);
    if (existing && existing.status === 'pending') return json({ error: 'You already have a pending application' }, 400);
    const body = await req.json().catch(() => ({}));
    if (!body.answers || typeof body.answers !== 'object') return json({ error: 'Invalid answers' }, 400);
    addSubmission(guildId, session.userId, body.answers);
    return json({ ok: true });
  } catch (err) {
    log.error('Apply error:', err);
    return json({ error: 'Failed to submit application' }, 500);
  }
}

async function handleReview(guildId, subId, session, req) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!['accepted', 'rejected'].includes(body.status)) return json({ error: 'Invalid status' }, 400);
    const sub = reviewSubmission(subId, body.status, session.userId);
    if (!sub) return json({ error: 'Submission not found' }, 404);
    try {
      const user = await clientRef.users.fetch(sub.user_id);
      if (body.status === 'accepted') {
        await user.send(`🎉 Your moderator application for **${getGuild(guildId)?.name || 'the server'}** has been **accepted**! A server administrator will reach out to you with further steps.`);
      } else {
        await user.send(`Your moderator application for **${getGuild(guildId)?.name || 'the server'}** has been **rejected**.`);
      }
    } catch (dmErr) { log.error('DM failed:', dmErr.message); }
    return json({ ok: true, status: body.status });
  } catch (err) {
    log.error('Review error:', err);
    return json({ error: 'Failed to review application' }, 500);
  }
}
