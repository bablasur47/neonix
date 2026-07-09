import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'slowmode';
export const description = 'Set slowmode in a channel.';
export const usage = 'slowmode <seconds> [#channel]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to set slowmode.`);
    return;
  }

  const channel = message.mentions.channels.first() || message.channel;
  const seconds = parseInt(args[0] || args[1] || '0');

  if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
    await reply(message, `${emojis.warning} Usage: \`slowmode <seconds>\` (0-21600)`);
    return;
  }

  try {
    await channel.setRateLimitPerUser(seconds);
    if (seconds > 0) {
      await reply(message, `${emojis.success} Slowmode set to ${seconds}s in ${channel}`);
    } else {
      await reply(message, `${emojis.success} Slowmode removed in ${channel}`);
    }
  } catch (err) {
    await reply(message, `${emojis.error} Failed to set slowmode: ${err.message}`);
  }
}
