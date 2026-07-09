import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'clone';
export const description = 'Clone a channel.';
export const usage = 'clone [#channel] [name]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const channel = message.mentions.channels.first() || message.channel;
  const name = args.join(' ') || `${channel.name}-copy`;

  try {
    await channel.clone({ name, reason: `Cloned by ${message.author.tag}` });
    await reply(message, `${emojis.success} Cloned ${channel} as **${name}**`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to clone: ${err.message}`);
  }
}
