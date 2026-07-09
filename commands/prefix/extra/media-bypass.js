import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'media-bypass';
export const description = 'Add/remove/reset/show media bypass roles/users';
export const usage = 'media bypass <add/remove/show/reset> [@role/@user]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const sub = args[0]?.toLowerCase();
  const db = getDb('media');

  if (sub === 'add') {
    const target = message.mentions.roles.first() || message.mentions.members.first();
    if (!target) {
      await reply(message, `${emojis.warning} Usage: \`media-bypass add @role/@user\``);
      return;
    }
    const type = message.mentions.roles.first() ? 'role' : 'user';
    db.run('INSERT OR IGNORE INTO media_bypass (guild_id, target_id, type) VALUES (?, ?, ?)',
      message.guild.id, target.id, type);
    await reply(message, `${emojis.success} **${target.name || target.user?.tag}** added to media bypass.`);
    return;
  }

  if (sub === 'remove') {
    const target = message.mentions.roles.first() || message.mentions.members.first();
    if (!target) {
      await reply(message, `${emojis.warning} Usage: \`media-bypass remove @role/@user\``);
      return;
    }
    db.run('DELETE FROM media_bypass WHERE guild_id = ? AND target_id = ?',
      [message.guild.id, target.id]);
    await reply(message, `${emojis.success} **${target.name || target.user?.tag}** removed from media bypass.`);
    return;
  }

  if (sub === 'reset') {
    db.run('DELETE FROM media_bypass WHERE guild_id = ?', [message.guild.id]);
    await reply(message, `${emojis.success} All media bypasses reset.`);
    return;
  }

  if (sub === 'show' || !sub) {
    const rows = db.query('SELECT target_id, type FROM media_bypass WHERE guild_id = ?')
      .all(message.guild.id);
    if (!rows.length) {
      await reply(message, `${emojis.info} No media bypasses set.`);
      return;
    }
    const list = rows.map(r =>
      r.type === 'role' ? `<@&${r.target_id}>` : `<@${r.target_id}>`
    ).join('\n');
    await reply(message, `${emojis.info} **Media Bypass:**\n${list}`);
    return;
  }

  await reply(message, `${emojis.warning} Usage: \`media-bypass add/remove/reset/show\``);
}
