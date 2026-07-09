import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'unmute';
export const description = 'Remove a timeout from a user.';
export const usage = 'unmute <@user>';
export const aliases = ['untimeout'];

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to unmute.`);
    return;
  }

  const member = message.mentions.members.first();
  if (!member) {
    await reply(message, `${emojis.warning} Usage: \`unmute @user\``);
    return;
  }

  try {
    await member.timeout(null);
    await reply(message, `${emojis.success} Unmuted **${member.user.tag}**`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to unmute: ${err.message}`);
  }
}
