import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'valorant';
export const description = 'View a Valorant profile via tracker.';
export const usage = 'valorant <riot id>';
export const aliases = ['val'];

export async function execute(message, args) {
  const input = args.join(' ');
  if (!input) return reply(message, 'Please provide a Riot ID (name#tag).\nUsage: `valorant name#tag`');
  if (!input.includes('#')) return reply(message, 'Please provide a full Riot ID with tag (e.g. player#NA1).');

  const [name, tag] = input.split('#');
  const url = `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(name)}%23${encodeURIComponent(tag)}/overview`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0xFD4556)
    .setTitle(data?.title || `Valorant: ${name}#${tag}`)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Valorant Tracker' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
