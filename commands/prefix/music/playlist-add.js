import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'playlist-add';
export const description = 'Add a track to one of your playlists.';
export const usage = 'playlist add <name> [url]';

export async function execute(message, args) {
  const [playlistName, ...rest] = args;
  if (!playlistName) {
    await reply(message, `${emojis.warning} Usage: \`playlist add <name> [url]\``);
    return;
  }

  const db = getDb('playlists');
  const playlist = db.query('SELECT id FROM playlists WHERE name = ? AND user_id = ?').get(playlistName, message.author.id);
  if (!playlist) {
    await reply(message, `${emojis.error} Playlist **${playlistName}** not found.`);
    return;
  }

  let trackData;

  if (rest.length > 0) {
    const query = rest.join(' ');
    const riffy = message.client.riffy;
    if (!riffy) {
      await reply(message, `${emojis.error} Music system is not connected.`);
      return;
    }
    const resolve = await riffy.resolve({ query, requester: message.author });
    if (resolve.loadType === 'error' || resolve.loadType === 'empty' || !resolve.tracks?.length) {
      await reply(message, `${emojis.error} No results for \`${query}\`.`);
      return;
    }
    if (resolve.loadType === 'playlist') {
      await reply(message, `${emojis.warning} Cannot add an entire playlist. Use a track URL or name.`);
      return;
    }
    trackData = {
      title: resolve.tracks[0].info.title,
      author: resolve.tracks[0].info.author,
      uri: resolve.tracks[0].info.uri,
      identifier: resolve.tracks[0].info.identifier || '',
      duration: resolve.tracks[0].info.length || 0,
    };
  } else {
    if (!message.client.riffy) {
      await reply(message, `${emojis.error} Music system is not connected.`);
      return;
    }
    const player = message.client.riffy.players.get(message.guild.id);
    if (!player || !player.current) {
      await reply(message, `${emojis.error} Nothing is playing. Provide a track URL or name.`);
      return;
    }
    trackData = {
      title: player.current.info.title,
      author: player.current.info.author,
      uri: player.current.info.uri,
      identifier: player.current.info.identifier || '',
      duration: player.current.info.length || 0,
    };
  }

  const existing = db.query(
    'SELECT id FROM playlist_tracks WHERE playlist_id = ? AND uri = ?'
  ).get(playlist.id, trackData.uri);
  if (existing) {
    await reply(message, `${emojis.warning} That track is already in **${playlistName}**.`);
    return;
  }

  db.run(
    'INSERT INTO playlist_tracks (playlist_id, title, author, uri, identifier, duration) VALUES (?, ?, ?, ?, ?, ?)',
    playlist.id,
    trackData.title,
    trackData.author,
    trackData.uri,
    trackData.identifier,
    trackData.duration
  );

  await reply(message, `${emojis.success} Added **${trackData.title}** to **${playlistName}**.`);
}
