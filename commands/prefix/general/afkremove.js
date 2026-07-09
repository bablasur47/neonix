import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'afkremove';
export const description = 'Remove your AFK status.';
export const usage = 'afkremove';
export const aliases = ['afkoff', 'unafk'];

export async function execute(message) {
  const db = getDb('afk');
  const existing = db.query(
    'SELECT reason, scope FROM afk_users WHERE user_id = ? AND (guild_id = ? OR scope = ?)'
  ).get(message.author.id, message.guild.id, 'global');

  if (!existing) {
    await reply(message, `${emojis.warning} You are not AFK.`);
    return;
  }

  db.run('DELETE FROM afk_users WHERE user_id = ?', [message.author.id]);
  await reply(message, `${emojis.success} Welcome back! AFK status removed.`);
}
