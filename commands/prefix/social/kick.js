import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'kick';
export const description = 'View a Kick channel.';
export const usage = 'kick <channel name>';
export const aliases = ['kicklive'];

export async function execute(message, args) {
  const channel = args[0]?.replace('https://kick.com/', '');
  if (!channel) return reply(message, 'Please provide a Kick channel name.\nUsage: `kick <channel>`');

  const url = `https://kick.com/${channel}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x53FC18)
    .setTitle(data?.title || channel)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Kick' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
