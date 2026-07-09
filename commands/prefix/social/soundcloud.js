import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'soundcloud';
export const description = 'View a SoundCloud profile.';
export const usage = 'soundcloud <username>';
export const aliases = ['sc'];

export async function execute(message, args) {
  const username = args[0]?.replace('@', '').replace('https://soundcloud.com/', '');
  if (!username) return reply(message, 'Please provide a SoundCloud username.\nUsage: `soundcloud <username>`');

  const url = `https://soundcloud.com/${username}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0xFF5500)
    .setTitle(data?.title || username)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'SoundCloud' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
