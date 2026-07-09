import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = '247';
export const aliases = ['24/7', '24h', 'stay'];
export const description = 'Toggle 24/7 mode to keep the bot in voice channel even when the queue ends';
export const usage = '247';

export async function execute(message) {
  const db = getDb('guilds');
  db.run('INSERT OR IGNORE INTO guild_config (guild_id) VALUES (?)', [message.guild.id]);

  const config = db.query('SELECT stay_247 FROM guild_config WHERE guild_id = ?').get(message.guild.id);
  const current = config?.stay_247 ? 1 : 0;
  const newVal = current ? 0 : 1;

  db.run('UPDATE guild_config SET stay_247 = ? WHERE guild_id = ?', [newVal, message.guild.id]);

  if (newVal) {
    await reply(message, `${emojis.music} 24/7 mode **enabled**. I will stay connected to the voice channel even when the queue ends.`);
  } else {
    await reply(message, `${emojis.music} 24/7 mode **disabled**. I will leave the voice channel when the queue ends.`);
  }
}
