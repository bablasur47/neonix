import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'snapchat';
export const description = 'View a Snapchat profile.';
export const usage = 'snapchat <username>';
export const aliases = [];

export async function execute(message, args) {
  const username = args[0]?.replace('@', '').replace('https://snapchat.com/add/', '');
  if (!username) return reply(message, 'Please provide a Snapchat username.\nUsage: `snapchat <username>`');

  const url = `https://www.snapchat.com/add/${username}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0xFFFC00)
    .setTitle(data?.title || username)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Snapchat' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
