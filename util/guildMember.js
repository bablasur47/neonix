import config from './config.js';

const API_BASE = 'https://discord.com/api/v10';
const HEADERS = {
  Authorization: `Bot ${config.token}`,
  'Content-Type': 'application/json',
};

export async function imageUrlToDataUri(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const contentType = response.headers.get('content-type');
  if (!contentType?.startsWith('image/')) {
    throw new Error(`Not an image (${contentType || 'unknown'})`);
  }

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${contentType};base64,${base64}`;
}

export async function patchGuildMember(guildId, updates) {
  const response = await fetch(`${API_BASE}/guilds/${guildId}/members/@me`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify(updates),
  });
  return response;
}

export function isOwner(userId) {
  return userId === config.ownerId;
}

export async function patchBotUser(updates) {
  const response = await fetch(`${API_BASE}/users/@me`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify(updates),
  });
  return response;
}
