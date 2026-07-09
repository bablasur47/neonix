import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'roblox';
export const description = 'View a Roblox profile.';
export const usage = 'roblox <username>';
export const aliases = ['rbx'];

export async function execute(message, args) {
  const username = args.join(' ');
  if (!username) return reply(message, 'Please provide a Roblox username.\nUsage: `roblox <username>`');

  const url = `https://www.roblox.com/search/users?keyword=${encodeURIComponent(username)}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x00B4FF)
    .setTitle(data?.title || username)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Roblox' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
