import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'playlist-play';
export const description = 'Queue all tracks from one of your playlists.';
export const usage = 'playlist play <name>';

export async function execute(message, args) {
  const name = args.join(' ')?.trim();
  if (!name) {
    await reply(message, `${emojis.warning} Usage: \`playlist play <name>\``);
    return;
  }

  const voice = message.member.voice.channel;
  if (!voice) {
    await reply(message, `${emojis.error} You must be in a voice channel.`);
    return;
  }

  const db = getDb('playlists');
  const playlist = db.query('SELECT id, name FROM playlists WHERE name = ? AND user_id = ?').get(name, message.author.id);
  if (!playlist) {
    await reply(message, `${emojis.error} Playlist **${name}** not found.`);
    return;
  }

  const tracks = db.query(
    'SELECT uri, title, author FROM playlist_tracks WHERE playlist_id = ? ORDER BY id ASC'
  ).all(playlist.id);

  if (!tracks.length) {
    await reply(message, `${emojis.info} **${playlist.name}** is empty.`);
    return;
  }

  const riffy = message.client.riffy;
  if (!riffy) {
    await reply(message, `${emojis.error} Music system is not connected.`);
    return;
  }
  const player = riffy.createConnection({
    guildId: message.guild.id,
    voiceChannel: voice.id,
    textChannel: message.channel.id,
    deaf: true,
  });

  let added = 0;
  for (const track of tracks) {
    const resolve = await riffy.resolve({ query: track.uri, requester: message.author });
    if (resolve.loadType === 'error' || resolve.loadType === 'empty' || !resolve.tracks?.length) continue;

    const t = resolve.tracks[0];
    t.info.requester = message.author;
    player.queue.add(t);
    added++;
  }

  if (!added) {
    await reply(message, `${emojis.error} Could not resolve any tracks from **${playlist.name}**.`);
    return;
  }

  if (!player.playing && !player.paused) {
    try {
      await player.play();
    } catch {
      try { await player.play(); } catch {}
    }
  }

  await reply(message, `${emojis.success} Queued **${added}** track(s) from **${playlist.name}**.`);
}
