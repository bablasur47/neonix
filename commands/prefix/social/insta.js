import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'insta';
export const description = 'Fix Instagram reel embeds on Discord via kkinstagram.';
export const usage = 'insta <reel url>';
export const aliases = ['instagram'];

export async function execute(message, args) {
  const url = args[0];
  if (!url) return reply(message, 'Please provide an Instagram reel URL.\nUsage: `insta <url>`');
  if (!url.includes('instagram.com')) return reply(message, 'Please provide a valid Instagram URL.');

  const newUrl = url.replace('www.instagram.com', 'www.kkinstagram.com');
  const data = await fetchMeta(newUrl);
  const embed = new EmbedBuilder()
    .setColor(0xE4405F)
    .setTitle(data?.title || 'Instagram Reel')
    .setURL(newUrl)
    .setDescription(data?.description || '')
    .setFooter({ text: 'kkinstagram' });
  if (data?.image) embed.setImage(data.image);
  await message.reply({ embeds: [embed] });
}
