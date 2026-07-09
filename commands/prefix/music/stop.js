import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'stop';
export const description = 'Stop the music and clear the queue';
export const usage = 'stop';

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

  player.queue.clear();
  player.stop();
  player.destroy();

  await reply(message, `${emojis.stop} Stopped the music and cleared the queue.`);
}
