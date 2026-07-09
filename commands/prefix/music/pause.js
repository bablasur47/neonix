import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'pause';
export const description = 'Pause the current track';
export const usage = 'pause';

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

  if (player.paused) {
    await reply(message, `${emojis.warning} Music is already paused. Use \`resume\`.`);
    return;
  }

  player.pause(true);
  await reply(message, `${emojis.pause} Paused.`);
}
