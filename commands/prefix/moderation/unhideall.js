import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { isAdmin } from '../../../util/permissions.js';

export const name = 'unhideall';
export const description = 'Unhide all channels from @everyone.';
export const usage = 'unhideall';

export async function execute(message) {
  if (!isAdmin(message.member)) {
    await reply(message, `${emojis.error} Only admins can unhide all channels.`);
    return;
  }

  const channels = message.guild.channels.cache.filter(c =>
    c.permissionOverwrites.cache.some(o =>
      o.id === c.guild.roles.everyone.id && !o.allow.has('ViewChannel')
    )
  );

  if (!channels.size) {
    await reply(message, `${emojis.info} No hidden channels found.`);
    return;
  }

  await reply(message, `${emojis.loading} Unhiding ${channels.size} channels...`);

  let done = 0;
  for (const ch of channels.values()) {
    try {
      await ch.permissionOverwrites.edit(ch.guild.roles.everyone, { ViewChannel: null });
      done++;
    } catch {}
  }

  await reply(message, `${emojis.success} Unhidden ${done}/${channels.size} channels.`);
}
