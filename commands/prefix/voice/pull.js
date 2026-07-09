import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'voice-pull';
export const description = 'Pull a user into your voice channel';
export const usage = 'voice-pull <@user>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const target = message.mentions.members.first();
  if (!target) {
    await reply(message, `${emojis.warning} Usage: \`voice-pull @user\``);
    return;
  }

  const channel = message.member.voice.channel;
  if (!channel) {
    await reply(message, `${emojis.error} You are not in a voice channel.`);
    return;
  }

  if (!target.voice.channelId) {
    await reply(message, `${emojis.error} That user is not in a voice channel.`);
    return;
  }

  await target.voice.setChannel(channel.id).catch(() => {});
  await reply(message, `${emojis.success} Pulled **${target.user.tag}** into ${channel.name}.`);
}
