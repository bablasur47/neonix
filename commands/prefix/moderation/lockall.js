import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { isAdmin } from '../../../util/permissions.js';

export const name = 'lockall';
export const description = 'Lock all text channels.';
export const usage = 'lockall';

export async function execute(message) {
  if (!isAdmin(message.member)) {
    await reply(message, `${emojis.error} Only admins can lock all channels.`);
    return;
  }

  const channels = message.guild.channels.cache.filter(c =>
    c.type === 0 && c.permissionsFor(c.guild.roles.everyone).has('SendMessages')
  );

  if (!channels.size) {
    await reply(message, `${emojis.info} No channels to lock.`);
    return;
  }

  await reply(message, `${emojis.loading} Locking ${channels.size} channels...`);

  let done = 0;
  for (const ch of channels.values()) {
    try {
      await ch.permissionOverwrites.edit(ch.guild.roles.everyone, { SendMessages: false });
      done++;
    } catch {}
  }

  await reply(message, `${emojis.success} Locked ${done}/${channels.size} channels.`);
}
