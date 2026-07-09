export function fmt(n) { return n.toLocaleString(); }

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function json(d, status = 200) {
  return new Response(JSON.stringify(d), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function html(s, status = 200) {
  return new Response(s, {
    status,
    headers: { 'Content-Type': 'text/html' },
  });
}

export function redirect(url) {
  return new Response(null, {
    status: 302,
    headers: { Location: url },
  });
}

export function getCookie(req, name) {
  const raw = req.headers.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function setCookie(name, value, maxAge = 86400) {
  return `${name}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export const PERM_ADMINISTRATOR = 0x8n;
export const PERM_MANAGE_GUILD = 0x20n;
export const PERM_BAN_MEMBERS = 0x4n;
export const PERM_KICK_MEMBERS = 0x2n;
export const PERM_MODERATE_MEMBERS = 0x1000000000n;

export function canManage(perms) {
  const p = BigInt(perms);
  return (p & PERM_ADMINISTRATOR) === PERM_ADMINISTRATOR ||
         (p & PERM_MANAGE_GUILD) === PERM_MANAGE_GUILD ||
         (p & PERM_BAN_MEMBERS) === PERM_BAN_MEMBERS ||
         (p & PERM_KICK_MEMBERS) === PERM_KICK_MEMBERS;
}

export function isAdmin(perms) {
  const p = BigInt(perms);
  return (p & PERM_ADMINISTRATOR) === PERM_ADMINISTRATOR ||
         (p & PERM_MANAGE_GUILD) === PERM_MANAGE_GUILD;
}
