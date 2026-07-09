import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'playlist-delete';
export const description = 'Delete one of your playlists.';
export const usage = 'playlist delete <name>';

export async function execute(message, args) {
  const name = args.join(' ')?.trim();
  if (!name) {
    await reply(message, `${emojis.warning} Usage: \`playlist delete <name>\``);
    return;
  }

  const db = getDb('playlists');
  const playlist = db.query('SELECT id FROM playlists WHERE name = ? AND user_id = ?').get(name, message.author.id);
  if (!playlist) {
    await reply(message, `${emojis.error} Playlist **${name}** not found.`);
    return;
  }

  db.run('DELETE FROM playlist_tracks WHERE playlist_id = ?', [playlist.id]);
  db.run('DELETE FROM playlists WHERE id = ?', [playlist.id]);

  await reply(message, `${emojis.success} Deleted playlist **${name}**.`);
}
