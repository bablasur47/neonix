import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'remove';
export const aliases = ['rm'];
export const description = 'Remove a track from the queue by position';
export const usage = 'remove <position>';

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

  const pos = parseInt(args[0]);
  if (!args[0] || isNaN(pos) || pos < 1 || pos > player.queue.length) {
    await reply(message, `${emojis.warning} Usage: \`remove <1-${player.queue.length || '?'}>\``);
    return;
  }

  const idx = pos - 1;
  const track = player.queue[idx];
  const title = track?.info?.title || 'Unknown';
  player.queue.splice(idx, 1);
  await reply(message, `${emojis.success} Removed **#${pos}**: ${title}`);
}
