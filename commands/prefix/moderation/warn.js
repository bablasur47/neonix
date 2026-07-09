import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'warn';
export const description = 'Warn a user.';
export const usage = 'warn <add/remove/clear/list> [@user] [reason] [id]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const sub = args[0]?.toLowerCase();
  const db = getDb('moderation');

  if (sub === 'add') {
    const target = message.mentions.members.first();
    const reason = args.slice(2).join(' ') || 'No reason';
    if (!target) {
      await reply(message, `${emojis.warning} Usage: \`warn add @user [reason]\``);
      return;
    }
    db.run('INSERT INTO warns (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)',
      [message.guild.id, target.id, message.author.id, reason]);
    const count = db.query('SELECT COUNT(*) as c FROM warns WHERE guild_id = ? AND user_id = ?')
      .get(message.guild.id, target.id).c;
    await reply(message, `${emojis.warning} Warned **${target.user.tag}** | ${reason} (Warning #${count})`);
    return;
  }

  if (sub === 'remove') {
    const id = args[1];
    if (!id) {
      await reply(message, `${emojis.warning} Usage: \`warn remove <warn_id>\``);
      return;
    }
    const result = db.run('DELETE FROM warns WHERE id = ? AND guild_id = ?', [id, message.guild.id]);
    if (result.changes) {
      await reply(message, `${emojis.success} Warning #${id} removed.`);
    } else {
      await reply(message, `${emojis.error} Warning #${id} not found.`);
    }
    return;
  }

  if (sub === 'clear' || sub === 'clearall') {
    const target = message.mentions.members.first();
    if (!target) {
      await reply(message, `${emojis.warning} Usage: \`warn clear @user\``);
      return;
    }
    const result = db.run('DELETE FROM warns WHERE guild_id = ? AND user_id = ?',
      [message.guild.id, target.id]);
    await reply(message, `${emojis.success} Cleared ${result.changes} warnings for **${target.user.tag}**`);
    return;
  }

  if (sub === 'list' || sub === 'show') {
    const target = message.mentions.members.first() || message.member;
    const warns = db.query(
      'SELECT id, reason, moderator_id, created_at FROM warns WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC'
    ).all(message.guild.id, target.id);

    if (!warns.length) {
      await reply(message, `${emojis.info} **${target.user.tag}** has no warnings.`);
      return;
    }

    const lines = warns.map((w, i) =>
      `#${w.id} | ${w.reason} — <t:${Math.floor(new Date(w.created_at + 'Z').getTime() / 1000)}:R>`
    );
    await reply(message, [`${emojis.info} **${target.user.tag}** — ${warns.length} warning(s):`, '---', ...lines]);
    return;
  }

  await reply(message, `${emojis.warning} Usage: \`warn add @user [reason]\` \`warn remove <id>\` \`warn clear @user\` \`warn list [@user]\``);
}
