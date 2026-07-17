import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { moveTrack } from './queue.js';

export const name = 'move';
export const aliases = ['mv'];
export const description = 'Move a track to a new position in the queue';
export const usage = 'move <from> <to>';

export async function execute(message, args) {
  if (!message.client.riffy) {
    await reply(message, `${emojis.error} Music system is not connected.`);
    return;
  }
  const player = message.client.riffy.players.get(message.guild.id);
  if (!player) {
    await reply(message, `${emojis.error} No music is playing.`);
    return;
  }

  const from = parseInt(args[0]);
  const to = parseInt(args[1]);
  const len = player.queue.length;
  if (isNaN(from) || isNaN(to) || from < 1 || to < 1 || from > len || to > len) {
    await reply(message, `${emojis.warning} Usage: \`move <from> <to>\` — positions must be between 1 and ${len || '?'}.`);
    return;
  }
  if (from === to) {
    await reply(message, `${emojis.warning} That track is already at position **#${to}**.`);
    return;
  }

  const track = moveTrack(player, from, to);
  await reply(message, `${emojis.success} Moved **${track?.info?.title || 'Unknown'}** from **#${from}** to **#${to}**.`);
}
