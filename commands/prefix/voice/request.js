import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'voice-request';
export const description = 'Request to join a user\'s voice channel';
export const usage = 'voice-request <@user>';

export async function execute(message, args) {
  const target = message.mentions.members.first();
  if (!target) {
    await reply(message, `${emojis.warning} Usage: \`voice-request @user\``);
    return;
  }

  const channel = target.voice.channel;
  if (!channel) {
    await reply(message, `${emojis.error} That user is not in a voice channel.`);
    return;
  }

  await target.send(`${emojis.join} **${message.author.tag}** wants to join your voice channel **${channel.name}** in **${message.guild.name}**!\nhttps://discord.com/channels/${message.guild.id}/${channel.id}`).catch(() => {
    return reply(message, `${emojis.warning} Could not DM that user.`);
  });

  await reply(message, `${emojis.success} Request sent to **${target.user.tag}**.`);
}
