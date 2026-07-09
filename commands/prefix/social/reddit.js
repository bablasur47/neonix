import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'reddit';
export const description = 'View a Reddit profile or subreddit.';
export const usage = 'reddit <username or /r/subreddit>';
export const aliases = ['rdt'];

export async function execute(message, args) {
  const input = args[0]?.replace('https://reddit.com/', '').replace('https://www.reddit.com/', '');
  if (!input) return reply(message, 'Please provide a Reddit username or subreddit.\nUsage: `reddit <username>` or `reddit r/subreddit`');

  const isSub = input.startsWith('r/') || input.startsWith('/r/');
  const url = isSub
    ? `https://reddit.com/${input.replace(/^\/?r\//, 'r/')}`
    : `https://reddit.com/user/${input.replace(/^u\//, '').replace(/^\/?u\//, '')}`;

  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0xFF4500)
    .setTitle(data?.title || input)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: isSub ? 'Reddit - Subreddit' : 'Reddit - User' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
