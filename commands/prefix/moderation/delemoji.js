import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'delemoji';
export const description = 'Delete an emoji from the server.';
export const usage = 'delemoji <emoji>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const match = args[0]?.match(/<?a?:?\w+:(\d+)>/);
  const emojiId = match?.[1] || args[0];
  const emoji = message.guild.emojis.cache.get(emojiId);

  if (!emoji) {
    await reply(message, `${emojis.warning} Usage: \`delemoji :emoji:\``);
    return;
  }

  try {
    await emoji.delete(`Deleted by ${message.author.tag}`);
    await reply(message, `${emojis.success} Deleted **${emoji.name}**`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to delete: ${err.message}`);
  }
}
