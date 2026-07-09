import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'voice-kickall';
export const description = 'Disconnect all members from voice';
export const usage = 'voice-kickall';

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
      await m.voice.disconnect().catch(() => {});
      count++;
    }
  }

  await reply(message, `${emojis.success} Disconnected **${count}** members from ${channel.name}.`);
}
