import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'autoresponder-delete';
export const description = 'Delete an auto-responder by ID';
export const usage = 'autoresponder delete <id>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const id = parseInt(args[0]);
  if (!id) {
    await reply(message, `${emojis.warning} Usage: \`autoresponder-delete <id>\``);
    return;
  }

  const db = getDb('extra');
  const result = db.run('DELETE FROM autoresponder WHERE id = ? AND guild_id = ?', [id, message.guild.id]);

  if (result.changes === 0) {
    await reply(message, `${emojis.error} Auto-responder with ID **${id}** not found.`);
    return;
  }

  await reply(message, `${emojis.success} Auto-responder **${id}** deleted.`);
}
