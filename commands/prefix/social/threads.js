import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'threads';
export const description = 'View a Threads profile.';
export const usage = 'threads <username>';
export const aliases = ['thread'];

export async function execute(message, args) {
  const username = args[0]?.replace('@', '').replace('https://threads.net/@', '');
  if (!username) return reply(message, 'Please provide a Threads username.\nUsage: `threads <username>`');

  const url = `https://www.threads.net/@${username}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTitle(data?.title || `@${username}`)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Threads' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
