import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'volume';
export const aliases = ['vol'];
export const description = 'Set the playback volume (0-100)';
export const usage = 'volume <0-100>';

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

  const vol = parseInt(args[0]);
  if (isNaN(vol) || vol < 0 || vol > 100) {
    await reply(message, `${emojis.warning} Usage: \`volume <0-100>\`\nCurrent volume: **${player.volume}%**`);
    return;
  }

  player.setVolume(vol);
  await reply(message, `${emojis.volume} Volume set to **${vol}%**.`);
}
