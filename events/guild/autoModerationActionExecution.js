import { Events, AutoModerationActionType } from 'discord.js';
import { getDb } from '../../database/index.js';
import log from '../../util/console.js';

export const name = Events.AutoModerationActionExecution;

export async function execute(automodEvent) {
  try {
    const { guildId, userId, action, guild } = automodEvent;

    if (!guild) {
      log.warn('AutoMod: Guild not available in automod event');
      return;
    }

    const db = getDb('automod');
    const whitelist = db.query(
      'SELECT target_id, type FROM automod_whitelist WHERE guild_id = ?'
    ).all(guildId);

    if (!whitelist.length) {
      return;
    }

    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member) {
      log.warn(`AutoMod: Member ${userId} not found in guild ${guildId}`);
      return;
    }

    const isWhitelisted = whitelist.some(w =>
      (w.type === 'user' && w.target_id === userId) ||
      (w.type === 'role' && member.roles.cache.has(w.target_id))
    );

    if (!isWhitelisted) {
      return;
    }

    if (action.type === AutoModerationActionType.Timeout) {
      try {
        await member.timeout(null, 'AutoMod whitelist override');
        log.info(`AutoMod: Removed timeout from whitelisted member ${userId} in guild ${guildId}`);
      } catch (err) {
        log.error(`AutoMod: Failed to remove timeout from member ${userId}`, err);
      }
    }
  } catch (err) {
    log.error('AutoMod action execution handler', err);
  }
}
