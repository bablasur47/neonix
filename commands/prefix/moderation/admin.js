import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { isOwner } from '../../../util/permissions.js';

export const name = 'admin';
export const description = 'Manage admin roles.';
export const usage = 'admin <add/remove/reset/show> [@role]';

export async function execute(message, args) {
  if (!isOwner(message.member)) {
    await reply(message, `${emojis.error} Only the server owner can manage admin roles.`);
    return;
  }

  const sub = args[0]?.toLowerCase();
  const db = getDb('moderation');

  if (sub === 'add') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`admin add @role\``);
      return;
    }
    db.run('INSERT OR IGNORE INTO guild_roles (guild_id, type, role_id) VALUES (?, ?, ?)',
      [message.guild.id, 'admin', role.id]);
    await reply(message, `${emojis.success} **${role.name}** added as admin role.`);
    return;
  }

  if (sub === 'remove') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`admin remove @role\``);
      return;
    }
    db.run('DELETE FROM guild_roles WHERE guild_id = ? AND type = ? AND role_id = ?',
      [message.guild.id, 'admin', role.id]);
    await reply(message, `${emojis.success} **${role.name}** removed from admin roles.`);
    return;
  }

  if (sub === 'reset') {
    db.run('DELETE FROM guild_roles WHERE guild_id = ? AND type = ?', [message.guild.id, 'admin']);
    await reply(message, `${emojis.success} All admin roles reset.`);
    return;
  }

  if (sub === 'show' || !sub) {
    const rows = db.query('SELECT role_id FROM guild_roles WHERE guild_id = ? AND type = ?')
      .all(message.guild.id, 'admin');
    const roles = rows.map(r => `<@&${r.role_id}>`).join(', ') || 'None set';
    await reply(message, `${emojis.info} **Admin Roles:**\n${roles}`);
    return;
  }

  await reply(message, `${emojis.warning} Usage: \`admin add/remove/reset/show\``);
}
