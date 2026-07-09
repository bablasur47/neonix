import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'autoplay';
export const aliases = ['ap'];
export const description = 'Toggle autoplay for recommended songs when the queue ends';
export const usage = 'autoplay';

export async function execute(message) {
  if (!message.client.riffy) {
    await reply(message, `${emojis.error} Music system is not connected.`);
    return;
  }
  const player = message.client.riffy.players.get(message.guild.id);
  if (!player) {
    await reply(message, `${emojis.error} No music is playing.`);
    return;
  }

  if (player.isAutoplay) {
    player.isAutoplay = false;
    await reply(message, `${emojis.stop} Autoplay disabled.`);
  } else {
    player.isAutoplay = true;
    await reply(message, `${emojis.play} Autoplay enabled. Related songs will play automatically when the queue ends.`);
  }
}
