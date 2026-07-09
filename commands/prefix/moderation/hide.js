import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'hide';
export const description = 'Hide a channel from @everyone.';
export const usage = 'hide [#channel]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to hide channels.`);
    return;
  }

  const channel = message.mentions.channels.first() || message.channel;

  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      ViewChannel: false,
    });
    await reply(message, `${emojis.success} Hidden ${channel}`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to hide: ${err.message}`);
  }
}
