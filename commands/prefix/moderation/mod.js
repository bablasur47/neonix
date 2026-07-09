import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { isAdmin } from '../../../util/permissions.js';

export const name = 'mod';
export const description = 'Manage moderator roles.';
export const usage = 'mod <add/remove/reset/show/setup> [@role] [name]';

export async function execute(message, args) {
  if (!isAdmin(message.member)) {
    await reply(message, `${emojis.error} Only admins can manage mod roles.`);
    return;
  }

  const sub = args[0]?.toLowerCase();
  const db = getDb('moderation');

  if (sub === 'add') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`mod add @role\``);
      return;
    }
    db.run('INSERT OR IGNORE INTO guild_roles (guild_id, type, role_id) VALUES (?, ?, ?)',
      [message.guild.id, 'mod', role.id]);
    await reply(message, `${emojis.success} **${role.name}** added as mod role.`);
    return;
  }

  if (sub === 'remove') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`mod remove @role\``);
      return;
    }
    db.run('DELETE FROM guild_roles WHERE guild_id = ? AND type = ? AND role_id = ?',
      [message.guild.id, 'mod', role.id]);
    await reply(message, `${emojis.success} **${role.name}** removed from mod roles.`);
    return;
  }

  if (sub === 'reset') {
    db.run('DELETE FROM guild_roles WHERE guild_id = ? AND type = ?', [message.guild.id, 'mod']);
    await reply(message, `${emojis.success} All mod roles reset.`);
    return;
  }

  if (sub === 'show' || !sub) {
    const rows = db.query('SELECT role_id FROM guild_roles WHERE guild_id = ? AND type = ?')
      .all(message.guild.id, 'mod');
    const roles = rows.map(r => `<@&${r.role_id}>`).join(', ') || 'None set';
    await reply(message, `${emojis.info} **Mod Roles:**\n${roles}`);
    return;
  }

  if (sub === 'setup') {
    const name = args.slice(1).join(' ') || 'Moderator';
    let role = message.guild.roles.cache.find(r => r.name === name);
    if (!role) {
      role = await message.guild.roles.create({ name, reason: 'Mod setup' });
    }
    db.run('INSERT OR IGNORE INTO guild_roles (guild_id, type, role_id) VALUES (?, ?, ?)',
      [message.guild.id, 'mod', role.id]);
    await reply(message, `${emojis.success} Mod role **${role.name}** created and assigned.`);
    return;
  }

  await reply(message, `${emojis.warning} Usage: \`mod add/remove/reset/show/setup\``);
}
