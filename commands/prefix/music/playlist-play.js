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
      try {
        await Promise.all([
          player.filters.setEqualizer([
            { band: 0, gain: 0.0 }, { band: 1, gain: 0.04 }, { band: 2, gain: 0.06 },
            { band: 3, gain: 0.02 }, { band: 4, gain: -0.05 }, { band: 5, gain: -0.10 },
            { band: 6, gain: -0.12 }, { band: 7, gain: -0.08 }, { band: 8, gain: 0.0 },
            { band: 9, gain: 0.05 }, { band: 10, gain: 0.08 }, { band: 11, gain: 0.06 },
            { band: 12, gain: 0.04 }, { band: 13, gain: 0.02 }, { band: 14, gain: -0.02 }
          ]).catch(() => {}),
          player.filters.setChannelMix(true, { leftToLeft: 0.70, leftToRight: 0.30, rightToLeft: 0.30, rightToRight: 0.70 }).catch(() => {}),
        ]);
      } catch {}
    } catch {
      try { await player.play(); } catch {}
    }
  }

  await reply(message, `${emojis.success} Queued **${added}** track(s) from **${playlist.name}**.`);
}
