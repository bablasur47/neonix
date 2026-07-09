import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'voice-kick';
export const description = 'Disconnect a user from voice channel';
export const usage = 'voice-kick <@user>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const member = message.mentions.members.first();
  if (!member) {
    await reply(message, `${emojis.warning} Usage: \`voice-kick @user\``);
    return;
  }

  if (!member.voice.channelId) {
    await reply(message, `${emojis.error} That user is not in a voice channel.`);
    return;
  }

  await member.voice.disconnect().catch(() => {});
  await reply(message, `${emojis.success} **${member.user.tag}** disconnected from voice.`);
}
