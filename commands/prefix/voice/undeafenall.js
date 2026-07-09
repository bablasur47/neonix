import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'voice-undeafenall';
export const description = 'Undeafen all members in your voice channel';
export const usage = 'voice-undeafenall';

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
      await m.voice.setDeaf(false, `Undeafened by ${message.author.tag}`).catch(() => {});
      count++;
    }
  }

  await reply(message, `${emojis.success} Undeafened **${count}** members in ${channel.name}.`);
}
