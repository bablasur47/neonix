import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'voice-moveall';
export const description = 'Move all members from your VC to another VC';
export const usage = 'voice-moveall <#channel>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const from = message.member.voice.channel;
  if (!from) {
    await reply(message, `${emojis.error} You are not in a voice channel.`);
    return;
  }

  const to = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
  if (!to || to.type !== 2) {
    await reply(message, `${emojis.warning} Usage: \`voice-moveall <#channel|channel_id>\``);
    return;
  }

  let count = 0;
  for (const [, m] of from.members) {
    if (!m.user.bot) {
      await m.voice.setChannel(to.id).catch(() => {});
      count++;
    }
  }

  await reply(message, `${emojis.success} Moved **${count}** members from ${from.name} to **${to.name}**.`);
}
