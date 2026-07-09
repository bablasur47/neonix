import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'resume';
export const description = 'Resume the paused track';
export const usage = 'resume';

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

  if (!player.paused) {
    await reply(message, `${emojis.warning} Music is not paused.`);
    return;
  }

  player.pause(false);
  await reply(message, `${emojis.play} Resumed.`);
}
