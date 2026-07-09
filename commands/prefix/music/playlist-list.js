import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'playlist-list';
export const description = 'Show all your playlists.';
export const usage = 'playlist list';

export async function execute(message) {
  const db = getDb('playlists');
  const playlists = db.query(
    'SELECT p.id, p.name, COUNT(pt.id) as track_count FROM playlists p LEFT JOIN playlist_tracks pt ON pt.playlist_id = p.id WHERE p.user_id = ? GROUP BY p.id ORDER BY p.created_at DESC'
  ).all(message.author.id);

  if (!playlists.length) {
    await reply(message, `${emojis.info} You don't have any playlists. Use \`playlist create <name>\` to make one.`);
    return;
  }

  const lines = playlists.map((p, i) =>
    `**${i + 1}.** ${p.name} — ${p.track_count} track(s)`
  );

  await reply(message, `${emojis.music} **Your Playlists**\n` + lines.join('\n'));
}
