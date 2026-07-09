import { PermissionsBitField } from 'discord.js';
import { getDb } from '../database/index.js';

export function isAdmin(member) {
  if (member.id === member.guild.ownerId) return true;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;

  const db = getDb('moderation');
  const rows = db.query('SELECT role_id FROM guild_roles WHERE guild_id = ? AND type = ?')
    .all(member.guild.id, 'admin');
  return rows.some(r => member.roles.cache.has(r.role_id));
}

export function isMod(member) {
  if (isAdmin(member)) return true;

  const db = getDb('moderation');
  const rows = db.query('SELECT role_id FROM guild_roles WHERE guild_id = ? AND type = ?')
    .all(member.guild.id, 'mod');
  return rows.some(r => member.roles.cache.has(r.role_id));
}

export function isOwner(member) {
  if (member.id === member.guild.ownerId) return true;

  const db = getDb('moderation');
  const rows = db.query('SELECT role_id FROM guild_roles WHERE guild_id = ? AND type = ?')
    .all(member.guild.id, 'owner');
  return rows.some(r => member.roles.cache.has(r.role_id));
}

export function canModerate(member) {
  return isMod(member);
}
