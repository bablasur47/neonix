import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'delsticker';
export const description = 'Delete a sticker from the server.';
export const usage = 'delsticker <sticker_id>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const stickerId = args[0];
  if (!stickerId) {
    await reply(message, `${emojis.warning} Usage: \`delsticker <sticker_id>\``);
    return;
  }

  try {
    await message.guild.stickers.delete(stickerId, `Deleted by ${message.author.tag}`);
    await reply(message, `${emojis.success} Sticker deleted.`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to delete: ${err.message}`);
  }
}
