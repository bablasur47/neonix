import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'kick';
export const description = 'Kick a user from the server.';
export const usage = 'kick <@user> [reason]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to kick.`);
    return;
  }

  const member = message.mentions.members.first();
  if (!member) {
    await reply(message, `${emojis.warning} Usage: \`kick @user [reason]\``);
    return;
  }

  if (member.id === message.author.id) {
    await reply(message, `${emojis.error} You cannot kick yourself.`);
    return;
  }

  const reason = args.slice(1).join(' ') || 'No reason provided';

  try {
    await member.kick(`${message.author.tag}: ${reason}`);
    await reply(message, `${emojis.success} Kicked **${member.user.tag}** | ${reason}`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to kick: ${err.message}`);
  }
}
