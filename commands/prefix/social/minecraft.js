import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'minecraft';
export const description = 'View a Minecraft profile/skin.';
export const usage = 'minecraft <username>';
export const aliases = ['mc'];

export async function execute(message, args) {
  const username = args[0];
  if (!username) return reply(message, 'Please provide a Minecraft username.\nUsage: `minecraft <username>`');

  const url = `https://namemc.com/profile/${username}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x4CAF50)
    .setTitle(data?.title || username)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'NameMC' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
