import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'modmail-block';
export const description = 'Block a user or role from using modmail.';
export const usage = 'modmail-block <@user/@role> [list/remove]';
export const aliases = ['mm-block'];

export async function execute(message, args) {
  if (!message.member.permissions.has('Administrator')) {
    await reply(message, `${emojis.error} You need Administrator permission.`);
    return;
  }

  const db = getDb('modmail');
  const config = db.query('SELECT * FROM modmail_config WHERE guild_id = ?').get(message.guild.id);
  if (!config) {
    await reply(message, `${emojis.warning} Modmail is not setup. Use \`modmail-setup\` first.`);
    return;
  }

  const sub = args[0]?.toLowerCase();
  const target = message.mentions.users.first() || message.mentions.roles.first();

  if (sub === 'list') {
    const blocked = db.query('SELECT * FROM modmail_blocked WHERE guild_id = ?').all(message.guild.id);
    if (!blocked.length) {
      await reply(message, `${emojis.info} No blocked users or roles.`);
      return;
    }
    const lines = blocked.map(b => {
      const mention = b.type === 'role' ? `<@&${b.target_id}>` : `<@${b.target_id}>`;
      return `${mention} (${b.type})`;
    });
    await reply(message, `${emojis.modmail} **Blocked from modmail:**\n${lines.join('\n')}`);
    return;
  }

  if (sub === 'remove' || sub === 'delete' || sub === 'unblock') {
    const unblockTarget = message.mentions.users.first() || message.mentions.roles.first();
    if (!unblockTarget) {
      await reply(message, `${emojis.warning} Usage: \`modmail-block remove @user/@role\``);
      return;
    }
    const removed = db.run(
      'DELETE FROM modmail_blocked WHERE guild_id = ? AND target_id = ?',
      message.guild.id, unblockTarget.id
    );
    if (removed.changes > 0) {
      await reply(message, `${emojis.success} Unblocked ${unblockTarget.toString()} from modmail.`);
    } else {
      await reply(message, `${emojis.info} ${unblockTarget.toString()} was not blocked.`);
    }
    return;
  }

  if (!target) {
    await reply(message, `${emojis.warning} Usage: \`modmail-block @user/@role\`\n\`modmail-block list\`\n\`modmail-block remove @user/@role\``);
    return;
  }

  const type = message.mentions.roles.first() ? 'role' : 'user';
  try {
    db.run(
      'INSERT INTO modmail_blocked (guild_id, target_id, type) VALUES (?, ?, ?)',
      message.guild.id, target.id, type
    );
    await reply(message, `${emojis.success} Blocked ${target.toString()} from using modmail.`);
  } catch {
    await reply(message, `${emojis.warning} ${target.toString()} is already blocked.`);
  }
}
