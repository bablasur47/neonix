import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'voice-unmuteall';
export const description = 'Unmute all members in your voice channel';
export const usage = 'voice-unmuteall';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const channel = message.member.voice.channel;
  if (!channel) {
    await reply(message, `${emojis.error} You are not in a voice channel.`);
    return;
  }

  let count = 0;
  for (const [, m] of channel.members) {
    if (!m.user.bot) {
      await m.voice.setMute(false, `Unmuted by ${message.author.tag}`).catch(() => {});
      count++;
    }
  }

  await reply(message, `${emojis.success} Unmuted **${count}** members in ${channel.name}.`);
}
