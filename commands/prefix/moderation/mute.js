import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'mute';
export const description = 'Timeout/mute a user.';
export const usage = 'mute <@user> [duration] [reason]';
export const aliases = ['timeout'];

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to mute.`);
    return;
  }

  const member = message.mentions.members.first();
  if (!member) {
    await reply(message, `${emojis.warning} Usage: \`mute @user [duration] [reason]\``);
    return;
  }

  if (member.id === message.author.id) {
    await reply(message, `${emojis.error} You cannot mute yourself.`);
    return;
  }

  let duration = 3600000;
  const durArg = args[1];
  if (durArg) {
    const match = durArg.match(/^(\d+)(s|m|h|d)$/);
    if (match) {
      const num = parseInt(match[1]);
      const unit = match[2];
      duration = num * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit] || 60000);
    } else {
      duration = parseInt(durArg) * 60000;
    }
  }

  const reason = args.slice(2).join(' ') || args.slice(1).join(' ') || 'No reason provided';

  try {
    await member.timeout(duration, `${message.author.tag}: ${reason}`);
    const mins = Math.round(duration / 60000);
    await reply(message, `${emojis.success} Muted **${member.user.tag}** for ${mins}min | ${reason}`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to mute: ${err.message}`);
  }
}
