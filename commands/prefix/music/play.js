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
