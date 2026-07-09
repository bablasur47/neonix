import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'playlist-create';
export const description = 'Create a new playlist.';
export const usage = 'playlist create <name>';

export async function execute(message, args) {
  const name = args.join(' ')?.trim();
  if (!name || name.length > 100) {
    await reply(message, `${emojis.warning} Usage: \`playlist create <name>\` (max 100 chars)`);
    return;
  }

  const db = getDb('playlists');
  try {
    db.run('INSERT INTO playlists (name, user_id, guild_id) VALUES (?, ?, ?)', [name, message.author.id, message.guild.id]);
    await reply(message, `${emojis.success} Playlist **${name}** created!`);
  } catch {
    await reply(message, `${emojis.error} You already have a playlist named **${name}**.`);
  }
}
