import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { isAdmin } from '../../../util/permissions.js';

export const name = 'hideall';
export const description = 'Hide all channels from @everyone.';
export const usage = 'hideall';

export async function execute(message) {
  if (!isAdmin(message.member)) {
    await reply(message, `${emojis.error} Only admins can hide all channels.`);
    return;
  }

  const channels = message.guild.channels.cache.filter(c =>
    c.permissionsFor(c.guild.roles.everyone).has('ViewChannel')
  );

  if (!channels.size) {
    await reply(message, `${emojis.info} No visible channels to hide.`);
    return;
  }

  await reply(message, `${emojis.loading} Hiding ${channels.size} channels...`);

  let done = 0;
  for (const ch of channels.values()) {
    try {
      await ch.permissionOverwrites.edit(ch.guild.roles.everyone, { ViewChannel: false });
      done++;
    } catch {}
  }

  await reply(message, `${emojis.success} Hidden ${done}/${channels.size} channels.`);
}
