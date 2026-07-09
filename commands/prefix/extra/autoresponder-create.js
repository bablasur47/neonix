import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'autoresponder-create';
export const description = 'Create an auto-responder trigger and response';
export const usage = 'autoresponder create <trigger> | <response>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const text = args.join(' ');
  const sep = text.indexOf('|');
  if (sep === -1 || !text.slice(0, sep).trim() || !text.slice(sep + 1).trim()) {
    await reply(message, `${emojis.warning} Usage: \`autoresponder-create <trigger> | <response>\``);
    return;
  }

  const trigger = text.slice(0, sep).trim();
  const response = text.slice(sep + 1).trim();

  const db = getDb('extra');
  db.run('INSERT INTO autoresponder (guild_id, trigger, response) VALUES (?, ?, ?)',
    message.guild.id, trigger, response);

  await reply(message, `${emojis.success} Auto-responder created: **${trigger}** → ${response}`);
}
