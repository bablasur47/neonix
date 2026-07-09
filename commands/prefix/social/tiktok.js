import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'tiktok';
export const description = 'View a TikTok profile.';
export const usage = 'tiktok <username>';
export const aliases = ['tt'];

export async function execute(message, args) {
  const username = args[0]?.replace('@', '').replace('https://tiktok.com/@', '');
  if (!username) return reply(message, 'Please provide a TikTok username.\nUsage: `tiktok <username>`');

  const url = `https://www.tiktok.com/@${username}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTitle(data?.title || `@${username}`)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'TikTok' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
