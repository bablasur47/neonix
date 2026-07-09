import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'modstats';
export const description = 'Show moderation statistics.';
export const usage = 'modstats';

export async function execute(message) {
  const db = getDb('moderation');
  const guildId = message.guild.id;

  const totalWarns = db.query('SELECT COUNT(*) as c FROM warns WHERE guild_id = ?').get(guildId).c;
  const uniqueUsers = db.query('SELECT COUNT(DISTINCT user_id) as c FROM warns WHERE guild_id = ?').get(guildId).c;
  const topMod = db.query(
    'SELECT moderator_id, COUNT(*) as c FROM warns WHERE guild_id = ? GROUP BY moderator_id ORDER BY c DESC LIMIT 1'
  ).get(guildId);

  const banCount = (await message.guild.bans.fetch().catch(() => null))?.size ?? 0;
  const online = message.guild.members.cache.filter(m => m.presence?.status === 'online').size;

  await reply(message,
    `${emojis.info} **Mod Stats for ${message.guild.name}**\n` +
    `Total warnings: **${totalWarns}**\n` +
    `Warned users: **${uniqueUsers}**\n` +
    `Current bans: **${banCount}**\n` +
    `Online members: **${online}**\n` +
    (topMod ? `Top moderator: <@${topMod.moderator_id}> (**${topMod.c}** warns)\n` : '')
  );
}
