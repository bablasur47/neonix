import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'unlock';
export const description = 'Unlock a channel.';
export const usage = 'unlock [#channel]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to unlock channels.`);
    return;
  }

  const channel = message.mentions.channels.first() || message.channel;

  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SendMessages: null,
    });
    await reply(message, `${emojis.success} Unlocked ${channel}`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to unlock: ${err.message}`);
  }
}
