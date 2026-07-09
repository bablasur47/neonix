import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'letterboxd';
export const description = 'View a Letterboxd profile.';
export const usage = 'letterboxd <username>';
export const aliases = ['lbxd'];

export async function execute(message, args) {
  const username = args[0]?.replace('@', '').replace('https://letterboxd.com/', '');
  if (!username) return reply(message, 'Please provide a Letterboxd username.\nUsage: `letterboxd <username>`');

  const url = `https://letterboxd.com/${username}/`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x09B83E)
    .setTitle(data?.title || username)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Letterboxd' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
