import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'voice-deafenall';
export const description = 'Deafen all members in your voice channel';
export const usage = 'voice-deafenall';

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
      await m.voice.setDeaf(true, `Deafened by ${message.author.tag}`).catch(() => {});
      count++;
    }
  }

  await reply(message, `${emojis.success} Deafened **${count}** members in ${channel.name}.`);
}
