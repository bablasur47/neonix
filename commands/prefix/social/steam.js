import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'steam';
export const description = 'View a Steam profile.';
export const usage = 'steam <custom URL or steamID>';
export const aliases = ['steamid'];

export async function execute(message, args) {
  const input = args.join(' ').replace('https://steamcommunity.com/id/', '').replace('https://steamcommunity.com/profiles/', '');
  if (!input) return reply(message, 'Please provide a Steam custom URL or ID.\nUsage: `steam <customurl>`');

  const url = /^\d+$/.test(input)
    ? `https://steamcommunity.com/profiles/${input}`
    : `https://steamcommunity.com/id/${input}`;

  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x171A21)
    .setTitle(data?.title || input)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Steam' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
