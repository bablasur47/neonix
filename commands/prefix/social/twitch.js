import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'twitch';
export const description = 'View a Twitch channel.';
export const usage = 'twitch <username>';
export const aliases = ['ttv'];

export async function execute(message, args) {
  const username = args[0]?.replace('https://twitch.tv/', '').replace('https://www.twitch.tv/', '');
  if (!username) return reply(message, 'Please provide a Twitch username.\nUsage: `twitch <username>`');

  const url = `https://www.twitch.tv/${username}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x9146FF)
    .setTitle(data?.title || username)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Twitch' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
