import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'glist';
export const description = 'List all ongoing giveaways in the server';
export const usage = 'glist';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const db = getDb('giveaways');
  const rows = db.query(
    'SELECT id, prize, winners, ends_at, host_id, message_id FROM giveaways WHERE guild_id = ? AND ended = 0 ORDER BY ends_at'
  ).all(message.guild.id);

  if (!rows.length) {
    await reply(message, `${emojis.info} No ongoing giveaways in this server.`);
    return;
  }

  const list = rows.map(r => {
    const endTs = Math.floor(new Date(r.ends_at).getTime() / 1000);
    return `\`${r.message_id}\` — **${r.prize}** (${r.winners} winner(s)) — Ends: <t:${endTs}:R> — Host: <@${r.host_id}>`;
  }).join('\n');

  await reply(message, `${emojis.gift} **Ongoing Giveaways (${rows.length}):**\n${list.slice(0, 1900)}`);
}
