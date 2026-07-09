import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import { fetchMeta } from '../../../util/fetchmeta.js';

export const name = 'chess';
export const description = 'View a Chess.com profile.';
export const usage = 'chess <username>';
export const aliases = ['chesscom'];

export async function execute(message, args) {
  const username = args[0]?.replace('https://chess.com/member/', '').replace('https://www.chess.com/', '');
  if (!username) return reply(message, 'Please provide a Chess.com username.\nUsage: `chess <username>`');

  const url = `https://www.chess.com/member/${username}`;
  const data = await fetchMeta(url);
  const embed = new EmbedBuilder()
    .setColor(0x769656)
    .setTitle(data?.title || username)
    .setURL(url)
    .setDescription(data?.description || '')
    .setFooter({ text: 'Chess.com' });
  if (data?.image) embed.setThumbnail(data.image);
  await message.reply({ embeds: [embed] });
}
