import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'stickersearch';
export const description = 'Search for stickers by name.';
export const usage = 'stickersearch <name>';
export const aliases = ['findsticker', 'stickerfind'];

export async function execute(message, args) {
  const query = args.join(' ').toLowerCase();
  if (!query) {
    await reply(message, `${emojis.warning} Usage: \`stickersearch <name>\``);
    return;
  }

  const stickers = await message.guild.stickers.fetch().catch(() => null);
  if (!stickers?.size) {
    await reply(message, `${emojis.info} No stickers in this server.`);
    return;
  }

  const found = stickers.filter(s => s.name.toLowerCase().includes(query));
  if (!found.size) {
    await reply(message, `${emojis.info} No stickers found matching **${query}**`);
    return;
  }

  const formatted = found.map(s => `• **${s.name}** — \`${s.id}\``).join('\n');
  await reply(message, `${emojis.info} **Found ${found.size} sticker(s):**\n${formatted}`);
}
