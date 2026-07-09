import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'twitter';
export const description = 'View a Twitter/X profile.';
export const usage = 'twitter <username>';
export const aliases = ['x'];

export async function execute(message, args) {
  const username = args[0]?.replace('@', '').replace('https://x.com/', '').replace('https://twitter.com/', '');
  if (!username) return reply(message, 'Please provide a Twitter username.\nUsage: `twitter <username>`');

  const url = `https://twitter.com/${username}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x1DA1F2)
    .setTitle(data?.title || `@${username}`)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Twitter' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
