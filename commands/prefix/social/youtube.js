import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'youtube';
export const description = 'View a YouTube channel.';
export const usage = 'youtube <channel name or handle>';
export const aliases = ['yt'];

export async function execute(message, args) {
  const input = args.join(' ')?.replace('https://youtube.com/@', '').replace('https://www.youtube.com/@', '');
  if (!input) return reply(message, 'Please provide a YouTube channel name.\nUsage: `youtube <channel>`');

  const url = `https://www.youtube.com/@${input.replace('@', '')}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle(data?.title || input)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'YouTube' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
