import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'unslowmode';
export const description = 'Remove slowmode from a channel.';
export const usage = 'unslowmode [#channel]';
export const aliases = ['noslowmode', 'removeslowmode'];

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to remove slowmode.`);
    return;
  }

  const channel = message.mentions.channels.first() || message.channel;

  try {
    await channel.setRateLimitPerUser(0);
    await reply(message, `${emojis.success} Slowmode removed from ${channel}`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to remove slowmode: ${err.message}`);
  }
}
