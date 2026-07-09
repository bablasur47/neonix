import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'ban';
export const description = 'Ban a user from the server.';
export const usage = 'ban <@user> [reason]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to ban.`);
    return;
  }

  const target = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);
  if (!target) {
    await reply(message, `${emojis.warning} Usage: \`ban @user [reason]\``);
    return;
  }

  if (!target.bot && target.id === message.author.id) {
    await reply(message, `${emojis.error} You cannot ban yourself.`);
    return;
  }

  const reason = args.slice(1).join(' ') || 'No reason provided';

  try {
    await message.guild.members.ban(target.id, { reason: `${message.author.tag}: ${reason}` });
    await reply(message, `${emojis.success} Banned **${target.tag}** | ${reason}`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to ban ${target.tag}: ${err.message}`);
  }
}
