import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'pinterest';
export const description = 'View a Pinterest profile.';
export const usage = 'pinterest <username>';
export const aliases = ['pin'];

export async function execute(message, args) {
  const username = args[0]?.replace('@', '').replace('https://pinterest.com/', '');
  if (!username) return reply(message, 'Please provide a Pinterest username.\nUsage: `pinterest <username>`');

  const url = `https://www.pinterest.com/${username}/`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0xE60023)
    .setTitle(data?.title || username)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Pinterest' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
