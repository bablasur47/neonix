import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'skip';
export const aliases = ['next', 's'];
export const description = 'Skip the current track';
export const usage = 'skip';

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

  const current = player.current;
  player.stop();

  if (current) {
    await reply(message, `${emojis.skip} Skipped **${current.info.title}**.`);
  } else {
    await reply(message, `${emojis.skip} Skipped.`);
  }
}
