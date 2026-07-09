import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'github';
export const description = 'View a GitHub profile.';
export const usage = 'github <username>';
export const aliases = ['gh'];

export async function execute(message, args) {
  const username = args[0]?.replace('https://github.com/', '');
  if (!username) return reply(message, 'Please provide a GitHub username.\nUsage: `github <username>`');

  const url = `https://github.com/${username}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x333333)
    .setTitle(data?.title || username)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'GitHub' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
