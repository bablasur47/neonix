import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'owner';
export const description = 'Manage owner-level roles.';
export const usage = 'owner <add/remove/reset/show> [@role]';

export async function execute(message, args) {
  if (message.author.id !== message.guild.ownerId) {
    await reply(message, `${emojis.error} Only the server owner can use this command.`);
    return;
  }

  const sub = args[0]?.toLowerCase();
  const db = getDb('moderation');

  if (sub === 'add') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`owner add @role\``);
      return;
    }
    db.run('INSERT OR IGNORE INTO guild_roles (guild_id, type, role_id) VALUES (?, ?, ?)',
      [message.guild.id, 'owner', role.id]);
    await reply(message, `${emojis.success} **${role.name}** added as owner-level role.`);
    return;
  }

  if (sub === 'remove') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`owner remove @role\``);
      return;
    }
    db.run('DELETE FROM guild_roles WHERE guild_id = ? AND type = ? AND role_id = ?',
      [message.guild.id, 'owner', role.id]);
    await reply(message, `${emojis.success} **${role.name}** removed from owner-level roles.`);
    return;
  }

  if (sub === 'reset') {
    db.run('DELETE FROM guild_roles WHERE guild_id = ? AND type = ?', [message.guild.id, 'owner']);
    await reply(message, `${emojis.success} All owner-level roles reset.`);
    return;
  }

  if (sub === 'show' || !sub) {
    const rows = db.query('SELECT role_id FROM guild_roles WHERE guild_id = ? AND type = ?')
      .all(message.guild.id, 'owner');
    const roles = rows.map(r => `<@&${r.role_id}>`).join(', ') || 'None set';
    await reply(message, `${emojis.info} **Owner-level Roles:**\n${roles}`);
    return;
  }

  await reply(message, `${emojis.warning} Usage: \`owner add/remove/reset/show\``);
}
