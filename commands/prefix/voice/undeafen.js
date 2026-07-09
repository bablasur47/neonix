import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'voice-undeafen';
export const description = 'Server undeafen a user in voice channel';
export const usage = 'voice-undeafen <@user>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const member = message.mentions.members.first();
  if (!member) {
    await reply(message, `${emojis.warning} Usage: \`voice-undeafen @user\``);
    return;
  }

  if (!member.voice.channelId) {
    await reply(message, `${emojis.error} That user is not in a voice channel.`);
    return;
  }

  await member.voice.setDeaf(false, `Undeafened by ${message.author.tag}`).catch(() => {});
  await reply(message, `${emojis.success} **${member.user.tag}** undeafened.`);
}
