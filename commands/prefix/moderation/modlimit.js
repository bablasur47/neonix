import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { isAdmin } from '../../../util/permissions.js';

export const name = 'modlimit';
export const description = 'Set limits for moderator actions.';
export const usage = 'modlimit <set/reset/show> [admin/mod] [number]';

export async function execute(message, args) {
  if (!isAdmin(message.member)) {
    await reply(message, `${emojis.error} Only admins can manage mod limits.`);
    return;
  }

  const sub = args[0]?.toLowerCase();
  const db = getDb('guilds');

  if (sub === 'set') {
    const type = args[1]?.toLowerCase();
    const limit = parseInt(args[2]);

    if (type === 'admin') {
      db.run('INSERT INTO guild_config (guild_id, modlimit_admin) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET modlimit_admin = ?',
        [message.guild.id, limit, limit]);
      await reply(message, `${emojis.success} Admin modlimit set to **${limit}**.`);
    } else if (type === 'mod') {
      db.run('INSERT INTO guild_config (guild_id, modlimit_mod) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET modlimit_mod = ?',
        [message.guild.id, limit, limit]);
      await reply(message, `${emojis.success} Mod modlimit set to **${limit}**.`);
    } else {
      const actualLimit = parseInt(args[1]);
      if (isNaN(actualLimit)) {
        await reply(message, `${emojis.warning} Usage: \`modlimit set <number>\` or \`modlimit set admin/mod <number>\``);
        return;
      }
      db.run('INSERT INTO guild_config (guild_id, modlimit_admin, modlimit_mod) VALUES (?, ?, ?) ON CONFLICT(guild_id) DO UPDATE SET modlimit_admin = ?, modlimit_mod = ?',
        [message.guild.id, actualLimit, actualLimit, actualLimit, actualLimit]);
      await reply(message, `${emojis.success} Modlimit set to **${actualLimit}** for all.`);
    }
    return;
  }

  if (sub === 'reset') {
    db.run('UPDATE guild_config SET modlimit_admin = NULL, modlimit_mod = NULL WHERE guild_id = ?', [message.guild.id]);
    await reply(message, `${emojis.success} Modlimits reset to default.`);
    return;
  }

  if (sub === 'show') {
    const row = db.query('SELECT modlimit_admin, modlimit_mod FROM guild_config WHERE guild_id = ?')
      .get(message.guild.id);
    await reply(message,
      `${emojis.info} **Mod Limits**\n` +
      `Admin limit: ${row?.modlimit_admin ?? 'No limit'}\n` +
      `Mod limit: ${row?.modlimit_mod ?? 'No limit'}`
    );
    return;
  }

  await reply(message, `${emojis.warning} Usage: \`modlimit set <number>\` \`modlimit set admin/mod <number>\` \`modlimit reset\` \`modlimit show\``);
}
