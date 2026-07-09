import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'media';
export const description = 'Manage media-only channels and bypasses.';
export const usage = 'media [subcommand] [args]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const db = getDb('media');
  const channels = db.query('SELECT channel_id FROM media_channels WHERE guild_id = ?')
    .all(message.guild.id).length;
  const bypasses = db.query('SELECT target_id, type FROM media_bypass WHERE guild_id = ?')
    .all(message.guild.id);

  await reply(message,
    `${emojis.info} **Media Settings**\n` +
    `Media channels: **${channels}**\n` +
    `Bypass entries: **${bypasses.length}**\n` +
    `Use \`media-channel add/remove/reset/show\` and \`media-bypass add/remove/reset/show\``
  );
}
