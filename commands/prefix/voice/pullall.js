import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'voice-pullall';
export const description = 'Pull all members from another VC into yours';
export const usage = 'voice-pullall <#channel>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const target = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
  if (!target || target.type !== 2) {
    await reply(message, `${emojis.warning} Usage: \`voice-pullall <#channel|channel_id>\``);
    return;
  }

  const to = message.member.voice.channel;
  if (!to) {
    await reply(message, `${emojis.error} You are not in a voice channel.`);
    return;
  }

  let count = 0;
  for (const [, m] of target.members) {
    if (!m.user.bot) {
      await m.voice.setChannel(to.id).catch(() => {});
      count++;
    }
  }

  await reply(message, `${emojis.success} Pulled **${count}** members from ${target.name} to **${to.name}**.`);
}
