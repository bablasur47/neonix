import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'snipe';
export const description = 'Show the last deleted message.';
export const usage = 'snipe';

export async function execute(message) {
  const snipe = message.client.snipeCache?.get(message.channel.id);
  if (!snipe) {
    await reply(message, `${emojis.info} Nothing to snipe in this channel.`);
    return;
  }

  const time = Math.floor((Date.now() - snipe.timestamp) / 1000);
  await reply(message,
    `${emojis.info} **${snipe.author}** — <t:${time}:R>\n${snipe.content || '[no text content]'}`
  );
}
