import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'playlist-remove';
export const description = 'Remove a track from one of your playlists.';
export const usage = 'playlist remove <name> <track#>';

export async function execute(message, args) {
  const [playlistName, indexStr] = args;
  if (!playlistName || !indexStr) {
    await reply(message, `${emojis.warning} Usage: \`playlist remove <name> <track#>\``);
    return;
  }

  const index = parseInt(indexStr, 10);
  if (isNaN(index) || index < 1) {
    await reply(message, `${emojis.warning} Provide a valid track number.`);
    return;
  }

  const db = getDb('playlists');
  const playlist = db.query('SELECT id FROM playlists WHERE name = ? AND user_id = ?').get(playlistName, message.author.id);
  if (!playlist) {
    await reply(message, `${emojis.error} Playlist **${playlistName}** not found.`);
    return;
  }

  const tracks = db.query(
    'SELECT id, title FROM playlist_tracks WHERE playlist_id = ? ORDER BY id ASC'
  ).all(playlist.id);

  const track = tracks[index - 1];
  if (!track) {
    await reply(message, `${emojis.error} Track #${index} doesn't exist in **${playlistName}**.`);
    return;
  }

  db.run('DELETE FROM playlist_tracks WHERE id = ?', [track.id]);
  await reply(message, `${emojis.success} Removed **${track.title}** from **${playlistName}**.`);
}
