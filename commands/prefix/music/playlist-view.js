import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { formatTime } from '../../../util/riffy.js';

export const name = 'playlist-view';
export const description = 'View tracks in one of your playlists.';
export const usage = 'playlist view <name>';

export async function execute(message, args) {
  const name = args.join(' ')?.trim();
  if (!name) {
    await reply(message, `${emojis.warning} Usage: \`playlist view <name>\``);
    return;
  }

  const db = getDb('playlists');
  const playlist = db.query('SELECT id, name FROM playlists WHERE name = ? AND user_id = ?').get(name, message.author.id);
  if (!playlist) {
    await reply(message, `${emojis.error} Playlist **${name}** not found.`);
    return;
  }

  const tracks = db.query(
    'SELECT title, author, duration FROM playlist_tracks WHERE playlist_id = ? ORDER BY id ASC'
  ).all(playlist.id);

  if (!tracks.length) {
    await reply(message, `${emojis.info} **${playlist.name}** is empty.`);
    return;
  }

  const lines = tracks.map((t, i) =>
    `**${i + 1}.** ${t.title} — ${t.author} (\`${t.duration ? formatTime(t.duration) : '?'}\`)`
  );

  await reply(message, `${emojis.music} **${playlist.name}** (${tracks.length} tracks)\n` + lines.join('\n'));
}
