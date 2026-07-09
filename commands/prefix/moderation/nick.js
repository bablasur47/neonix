import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'nick';
export const description = 'Change a user\'s nickname.';
export const usage = 'nick <@user> <name>';
export const aliases = ['nickname'];

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to change nicknames.`);
    return;
  }

  const member = message.mentions.members.first();
  if (!member) {
    await reply(message, `${emojis.warning} Usage: \`nick @user <new nickname>\``);
    return;
  }

  const nick = args.slice(1).join(' ');
  if (!nick) {
    await reply(message, `${emojis.warning} Usage: \`nick @user <new nickname>\``);
    return;
  }

  try {
    await member.setNickname(nick, `By ${message.author.tag}`);
    await reply(message, `${emojis.success} Changed **${member.user.tag}**'s nickname to **${nick}**`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to change nickname: ${err.message}`);
  }
}
