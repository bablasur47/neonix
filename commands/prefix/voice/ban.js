import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'voice-ban';
export const description = 'Ban a user from the voice channel';
export const usage = 'voice-ban <@user>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const member = message.mentions.members.first();
  if (!member) {
    await reply(message, `${emojis.warning} Usage: \`voice-ban @user\``);
    return;
  }

  const channel = member.voice.channel;
  if (!channel) {
    await reply(message, `${emojis.error} That user is not in a voice channel.`);
    return;
  }

  await channel.permissionOverwrites.create(member.id, { Connect: false }).catch(() => {});
  await member.voice.disconnect().catch(() => {});
  await reply(message, `${emojis.success} **${member.user.tag}** banned from ${channel.name}.`);
}
