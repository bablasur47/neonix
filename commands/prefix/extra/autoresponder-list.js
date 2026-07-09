import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'autoresponder-list';
export const description = 'List all auto-responders';
export const usage = 'autoresponder list';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const db = getDb('extra');
  const rows = db.query('SELECT id, trigger, response FROM autoresponder WHERE guild_id = ? ORDER BY id')
    .all(message.guild.id);

  if (!rows.length) {
    await reply(message, `${emojis.info} No auto-responders configured.`);
    return;
  }

  const list = rows.map(r =>
    `\`${r.id}\` — **${r.trigger}** → ${r.response}`
  ).join('\n');

  await reply(message, `${emojis.info} **Auto-Responders:**\n${list.slice(0, 1900)}`);
}
