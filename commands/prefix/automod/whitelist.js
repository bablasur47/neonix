import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export async function handleWhitelist(message, args) {
  try {
    const sub = args[0]?.toLowerCase();
    const db = getDb('automod');
    const guildId = message.guild.id;

    if (sub === 'add') {
      const target = message.mentions.roles.first() || message.mentions.members.first();
      if (!target) {
        await reply(message, `${emojis.warning} Usage: \`automod whitelist add @role/@user\``);
        return;
      }

      const targetId = target.id;
      const type = message.mentions.roles.first() ? 'role' : 'user';
      const displayName = target.name || target.user?.tag || targetId;

      try {
        db.run('INSERT OR IGNORE INTO automod_whitelist (guild_id, target_id, type) VALUES (?, ?, ?)',
          [guildId, targetId, type]);
        await reply(message, `${emojis.success} **${displayName}** added to AutoMod whitelist.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to add to whitelist: ${err.message}`);
      }
      return;
    }

    if (sub === 'remove') {
      const target = message.mentions.roles.first() || message.mentions.members.first();
      if (!target) {
        await reply(message, `${emojis.warning} Usage: \`automod whitelist remove @role/@user\``);
        return;
      }

      const targetId = target.id;
      const displayName = target.name || target.user?.tag || targetId;

      try {
        db.run('DELETE FROM automod_whitelist WHERE guild_id = ? AND target_id = ?',
          [guildId, targetId]);
        await reply(message, `${emojis.success} **${displayName}** removed from AutoMod whitelist.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to remove from whitelist: ${err.message}`);
      }
      return;
    }

    if (sub === 'reset') {
      try {
        db.run('DELETE FROM automod_whitelist WHERE guild_id = ?', [guildId]);
        await reply(message, `${emojis.success} AutoMod whitelist reset.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to reset whitelist: ${err.message}`);
      }
      return;
    }

    if (sub === 'show' || !sub) {
      try {
        const rows = db.query('SELECT target_id, type FROM automod_whitelist WHERE guild_id = ?')
          .all(guildId);

        if (!rows.length) {
          await reply(message, `${emojis.info} No whitelist entries.`);
          return;
        }

        const list = rows.map(r => {
          const mention = r.type === 'role' ? `<@&${r.target_id}>` : `<@${r.target_id}>`;
          const type = r.type.charAt(0).toUpperCase() + r.type.slice(1);
          return `${mention} (${type})`;
        }).join('\n');

        await reply(message, `${emojis.info} **AutoMod Whitelist (${rows.length} entries):**\n${list}`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to fetch whitelist: ${err.message}`);
      }
      return;
    }

    await reply(message, `${emojis.warning} Usage: \`automod whitelist add/remove/show/reset [@role/@user]\``);
  } catch (err) {
    await reply(message, `${emojis.error} An unexpected error occurred.`);
  }
}
