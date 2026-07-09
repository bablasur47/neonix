import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'voice-invite';
export const description = 'Invite a user to your voice channel';
export const usage = 'voice-invite <@user>';

export async function execute(message, args) {
  const member = message.mentions.members.first();
  if (!member) {
    await reply(message, `${emojis.warning} Usage: \`voice-invite @user\``);
    return;
  }

  const channel = message.member.voice.channel;
  if (!channel) {
    await reply(message, `${emojis.error} You are not in a voice channel.`);
    return;
  }

  await member.send(`${emojis.join} **${message.author.tag}** invited you to **${channel.name}** in **${message.guild.name}**!\nhttps://discord.com/channels/${message.guild.id}/${channel.id}`).catch(() => {
    return reply(message, `${emojis.warning} Could not DM that user.`);
  });

  await reply(message, `${emojis.success} Invite sent to **${member.user.tag}**.`);
}
