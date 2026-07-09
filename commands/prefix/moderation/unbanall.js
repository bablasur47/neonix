import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { isAdmin } from '../../../util/permissions.js';

export const name = 'unbanall';
export const description = 'Unban all users from the server.';
export const usage = 'unbanall';

export async function execute(message) {
  if (!isAdmin(message.member)) {
    await reply(message, `${emojis.error} Only admins can unban all.`);
    return;
  }

  const bans = await message.guild.bans.fetch().catch(() => null);
  if (!bans?.size) {
    await reply(message, `${emojis.info} No bans to remove.`);
    return;
  }

  await reply(message, `${emojis.loading} Unbanning ${bans.size} users...`);

  let done = 0;
  for (const ban of bans.values()) {
    try {
      await message.guild.members.unban(ban.user.id);
      done++;
    } catch {}
  }

  await reply(message, `${emojis.success} Unbanned ${done}/${bans.size} users.`);
}
