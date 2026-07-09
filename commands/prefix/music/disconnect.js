import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'disconnect';
export const aliases = ['dc', 'leave'];
export const description = 'Disconnect the bot from voice channel';
export const usage = 'disconnect';

export async function execute(message) {
  if (!message.client.riffy) {
    await reply(message, `${emojis.error} Music system is not connected.`);
    return;
  }
  const player = message.client.riffy.players.get(message.guild.id);
  if (!player) {
    await reply(message, `${emojis.error} Not connected to a voice channel.`);
    return;
  }

  player.destroy();
  await reply(message, `${emojis.leave} Disconnected.`);
}
