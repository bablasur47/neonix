import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'bluesky';
export const description = 'View a Bluesky profile.';
export const usage = 'bluesky <handle>';
export const aliases = ['bsky'];

export async function execute(message, args) {
  const handle = args[0]?.replace('https://bsky.app/profile/', '');
  if (!handle) return reply(message, 'Please provide a Bluesky handle (e.g. user.bsky.social).\nUsage: `bluesky <handle>`');
  if (!handle.includes('.')) return reply(message, 'Please provide a full Bluesky handle (e.g. user.bsky.social).');

  const url = `https://bsky.app/profile/${handle}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x1185FE)
    .setTitle(data?.title || handle)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Bluesky' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
