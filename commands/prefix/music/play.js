import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { formatTime } from '../../../util/riffy.js';

export const name = 'play';
export const aliases = ['p'];
export const description = 'Play a song or playlist from YouTube/Spotify/SoundCloud';
export const usage = 'play <song name or URL>';

export async function execute(message, args) {
  const voice = message.member.voice.channel;
  if (!voice) {
    await reply(message, `${emojis.error} You must be in a voice channel.`);
    return;
  }

  const query = args.join(' ');
  if (!query) {
    await reply(message, `${emojis.warning} Usage: \`play <song name or URL>\``);
    return;
  }

  const riffy = message.client.riffy;
  if (!riffy) {
    await reply(message, `${emojis.error} Music system is not connected.`);
    return;
  }
  if (riffy.leastUsedNodes.length === 0) {
    await reply(message, `${emojis.error} No Lavalink node available. The configured Lavalink server(s) may be offline. Check your \`LAVALINK_HOST\` / \`LAVALINK_NODES\` env vars or try again later.`);
    return;
  }

  const player = riffy.createConnection({
    guildId: message.guild.id,
    voiceChannel: voice.id,
    textChannel: message.channel.id,
    deaf: true,
  });

  const resolve = await riffy.resolve({ query, requester: message.author });
  const { loadType, tracks, playlistInfo } = resolve;

  if (loadType === 'error' || loadType === 'empty' || !tracks?.length) {
    await reply(message, `${emojis.error} No results found for \`${query}\`.`);
    return;
  }

  if (loadType === 'playlist') {
    for (const track of tracks) {
      track.info.requester = message.author;
      player.queue.add(track);
    }
    if (!player.playing && !player.paused) {
      if (!player.connection.isReady) {
        for (let i = 0; i < 20; i++) {
          if (player.connection.isReady) break;
          await new Promise(r => setTimeout(r, 200));
        }
      }
      try {
        await player.play();
      } catch {
        await new Promise(r => setTimeout(r, 500));
        await player.play();
      }
    }
    await reply(message, `${emojis.success} Added **${tracks.length}** tracks from playlist **${playlistInfo.name}**`);
    return;
  }

  const track = tracks.shift();
  track.info.requester = message.author;
  player.queue.add(track);

  if (!player.playing && !player.paused) {
    if (!player.connection.isReady) {
      for (let i = 0; i < 25; i++) {
        if (player.connection.isReady) break;
        await new Promise(r => setTimeout(r, 200));
      }
    }
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
      if (player.queue.length === 0) player.queue.add(track);
      await new Promise(r => setTimeout(r, 500));
      try { await player.play(); } catch {}
    }
    await reply(message, `${emojis.play} Playing **${track.info.title}** by **${track.info.author}** (\`${formatTime(track.info.length)}\`)`);
  } else {
    await reply(message, `${emojis.queue} Added **${track.info.title}** to queue (position #${player.queue.size})`);
  }
}
