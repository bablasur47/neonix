import { PermissionsBitField } from 'discord.js';
import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'lock';
export const description = 'Lock a channel.';
export const usage = 'lock [#channel] [reason]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to lock channels.`);
    return;
  }

  const channel = message.mentions.channels.first() || message.channel;
  const reason = args.join(' ') || 'Locked by moderator';

  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SendMessages: false,
    }, { reason });
    await reply(message, `${emojis.success} Locked ${channel} | ${reason}`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to lock: ${err.message}`);
  }
}
