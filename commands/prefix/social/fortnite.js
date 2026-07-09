import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'fortnite';
export const description = 'View Fortnite stats/profile.';
export const usage = 'fortnite <epic username>';
export const aliases = ['fn', 'fort'];

export async function execute(message, args) {
  const username = args.join(' ');
  if (!username) return reply(message, 'Please provide an Epic username.\nUsage: `fortnite <username>`');

  const url = `https://fortnitetracker.com/profile/all/${encodeURIComponent(username)}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x9C27B0)
    .setTitle(data?.title || `Fortnite: ${username}`)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Fortnite Tracker' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
