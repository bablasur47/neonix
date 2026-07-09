import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'unhide';
export const description = 'Unhide a channel from @everyone.';
export const usage = 'unhide [#channel]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to unhide channels.`);
    return;
  }

  const channel = message.mentions.channels.first() || message.channel;

  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      ViewChannel: null,
    });
    await reply(message, `${emojis.success} Unhidden ${channel}`);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to unhide: ${err.message}`);
  }
}
