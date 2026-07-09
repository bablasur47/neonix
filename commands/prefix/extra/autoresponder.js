import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'autoresponder';
export const description = 'Manage auto-responder triggers.';
export const usage = 'autoresponder [subcommand] [args]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const db = getDb('extra');
  const count = db.query('SELECT COUNT(*) as c FROM autoresponder WHERE guild_id = ?')
    .get(message.guild.id).c;

  await reply(message,
    `${emojis.info} **AutoResponder Settings**\n` +
    `Triggers: **${count}**\n` +
    `Use \`autoresponder-add <trigger> <response>\`, \`autoresponder-create\`, \`autoresponder-delete <id>\`, \`autoresponder-list\``
  );
}
