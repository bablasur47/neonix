import { Riffy } from 'riffy';
import config from './config.js';
import log from './console.js';
import { getDb } from '../database/index.js';
import emojis from './emoji.js';

const DEFAULT_VOLUME = 65;
const DEFAULT_SEARCH = 'ytmsearch';

const CRYSTAL_EQ = [
  { band: 0,  gain: 0.0  },
  { band: 1,  gain: 0.04 },
  { band: 2,  gain: 0.06 },
  { band: 3,  gain: 0.02 },
  { band: 4,  gain: -0.05 },
  { band: 5,  gain: -0.10 },
  { band: 6,  gain: -0.12 },
  { band: 7,  gain: -0.08 },
  { band: 8,  gain: 0.0  },
  { band: 9,  gain: 0.05 },
  { band: 10, gain: 0.08 },
  { band: 11, gain: 0.06 },
  { band: 12, gain: 0.04 },
  { band: 13, gain: 0.02 },
  { band: 14, gain: -0.02 },
];

const STEREO_WIDEN = {
  leftToLeft: 0.70,
  leftToRight: 0.30,
  rightToLeft: 0.30,
  rightToRight: 0.70,
};

async function getBestNode(riffy) {
  const nodes = riffy.nodeMap;
  if (!nodes || nodes.size === 0) return null;

  let best = null;
  let bestScore = Infinity;

  for (const [, node] of nodes) {
    if (node.state !== 1) continue;
    const stats = node.stats;
    if (!stats) { best = best || node; continue; }

    const cpu = stats.cpu?.systemUsage || 0;
    const mem = stats.memory?.used || 0;
    const memMax = stats.memory?.reservable || 1;
    const load = (cpu / 100) * 0.4 + (mem / memMax) * 0.3 + (stats.players || 0) * 0.3;
    const score = stats.penalties?.total || 0 + load * 100;

    if (score < bestScore) {
      bestScore = score;
      best = node;
    }
  }

  return best || riffy.nodeMap.values().next().value;
}

export function setupRiffy(client) {
  const nodes = config.lavalink.map((n, i) => ({
    ...n,
    name: n.name || `Node ${i + 1}`,
  }));

  const nodeConfigByName = new Map(nodes.map((n) => [n.name, n]));

  client.riffy = new Riffy(client, nodes, {
    send: (payload) => {
      const guild = client.guilds.cache.get(payload.d.guild_id);
      if (guild) guild.shard.send(payload);
    },
    defaultSearchPlatform: DEFAULT_SEARCH,
    restVersion: 'v4',
    resumeKey: `neonix-${client.user?.id || 'default'}`,
    resumeTimeout: 300,
    reconnectTries: Infinity,
    reconnectTimeout: 5000,
  });

  client.on('raw', (d) => {
    if (!d.t) return;
    if (!['VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE'].includes(d.t)) return;
    client.riffy.updateVoiceState(d);
  });

  client.riffy.on('nodeConnect', async (node) => {
    log.music(`Node "${node.name}" connected`);

    const best = await getBestNode(client.riffy);
    if (best && best.name !== node.name) {
      log.music(`Better node available: "${best.name}", staying on "${node.name}" for now`);
    }
  });

  client.riffy.on('nodeDisconnect', (node, reason) => {
    const msg = reason?.message || reason?.reason || (typeof reason === 'object' ? JSON.stringify(reason) : reason) || 'unknown';
    log.warn(`Node "${node.name}" disconnected: ${msg}`);
  });

  client.riffy.on('nodeReconnect', (node) => {
    log.music(`Node "${node.name}" reconnecting...`);
  });

  client.riffy.on('nodeError', (node, error) => {
    const name = node?.name || node?.host || 'Unknown';
    log.error(`${name}: ${error.message}`, error);
  });

  client.riffy.on('nodeDestroy', (node) => {
    const name = node?.name;
    if (!name) return;
    log.warn(`Node "${name}" was destroyed, scheduling self-heal in 30s...`);

    setTimeout(() => {
      if (client.riffy.nodeMap.has(name)) return;
      const nodeConfig = nodeConfigByName.get(name);
      if (!nodeConfig) return;
      try {
        client.riffy.createNode(nodeConfig);
        log.music(`Node "${name}" re-added to the pool after self-heal.`);
      } catch (err) {
        log.error(`Failed to self-heal node "${name}": ${err.message}`, err);
      }
    }, 30000);
  });

  client.riffy.on('trackStart', async (player, track) => {
    const channel = client.channels.cache.get(player.textChannel);
    if (!channel) return;

    const guildDb = getDb('guilds');
    const row = guildDb.query('SELECT volume FROM guild_config WHERE guild_id = ?').get(player.guildId);
    const guildVol = row?.volume ?? DEFAULT_VOLUME;
    if (player.volume !== guildVol) player.setVolume(guildVol);

    if (!player._filterPreset || player._filterPreset === 'clarity') {
      try {
        await Promise.all([
          player.filters.setEqualizer(CRYSTAL_EQ).catch(() => {}),
          player.filters.setChannelMix(true, STEREO_WIDEN).catch(() => {}),
        ]);
      } catch {}
    }

    try {
      const { initializeFonts, Bloom } = await import('musicard');
      await initializeFonts();

      const timeEnd = track.info.isStream ? 'LIVE' : formatTime(track.info.length);
      const artwork = track.info.artworkUrl || track.info.thumbnail || undefined;

      const card = await Bloom({
        trackName: track.info.title || 'Unknown',
        artistName: track.info.author || 'Unknown',
        albumArt: artwork,
        timeAdjust: { timeStart: '0:00', timeEnd },
        progressBar: 0,
        volumeBar: player.volume,
      });

      await channel.send({ files: [{ attachment: card, name: 'track.png' }] });
    } catch {
      const icon = track.info.isStream ? '🔴' : '🎵';
      await channel.send(`${icon} **${track.info.title}** — ${track.info.author} (\`${track.info.isStream ? 'LIVE' : formatTime(track.info.length)}\`)`);
    }
  });

  client.riffy.on('trackEnd', async (player, track, payload) => {
    if (payload?.reason === 'replaced') return;
    if (player.queue.length > 0) {
      if (!player._filterPreset || player._filterPreset === 'clarity') {
        try {
          await Promise.all([
            player.filters.setEqualizer(CRYSTAL_EQ).catch(() => {}),
            player.filters.setChannelMix(true, STEREO_WIDEN).catch(() => {}),
          ]);
        } catch {}
      }
    }
  });

  client.riffy.on('trackStuck', async (player, track, payload) => {
    const channel = client.channels.cache.get(player.textChannel);
    if (!channel) return;
    await channel.send({
      embeds: [{ description: `${emojis.warning} Track **${track.info.title}** got stuck, skipping...`, color: 0x2B2D31 }],
    }).catch(() => {});
    if (player.queue.length > 0) {
      try { await player.stop(); } catch {}
    }
  });

  client.riffy.on('trackError', async (player, track, payload) => {
    const channel = client.channels.cache.get(player.textChannel);
    if (!channel) return;

    const errMsg = payload?.exception?.message || payload?.error || 'Unknown error';
    const remaining = player.queue.length;
    const note = remaining > 0 ? `\nSkipping to next track... (**${remaining}** left in queue)` : '';
    await channel.send({
      embeds: [{
        description: `${emojis.error} Failed to play **${track.info.title}**: \`${errMsg}\`${note}`,
        color: 0x2B2D31,
      }],
    }).catch(() => {});

    if (remaining > 0) {
      try { await player.stop(); } catch {}
    }
  });

  function is247(guildId) {
    try {
      const db = getDb('guilds');
      const row = db.query('SELECT stay_247 FROM guild_config WHERE guild_id = ?').get(guildId);
      return row?.stay_247 === 1;
    } catch {
      return false;
    }
  }

  client.riffy.on('queueEnd', async (player) => {
    if (player.isAutoplay) {
      try {
        await player.autoplay(player);
        try {
          await Promise.all([
            player.filters.setEqualizer(CRYSTAL_EQ).catch(() => {}),
            player.filters.setChannelMix(true, STEREO_WIDEN).catch(() => {}),
          ]);
        } catch {}
      } catch {
        if (!is247(player.guildId)) player.destroy();
      }
    } else {
      if (!is247(player.guildId)) player.destroy();
    }
  });

  client.riffy.on('playerDisconnect', () => {});

  client.riffy.on('playerMove', async (player, oldChannel, newChannel) => {
    if (!newChannel) {
      if (!is247(player.guildId)) player.destroy();
      return;
    }
    player.voiceChannel = newChannel;
    if (player.paused) player.pause(player);
    setTimeout(() => {
      if (player.playing || player.paused) return;
      try { player.connect(); } catch {}
    }, 1000);
  });

  client.riffy.on('playerCreate', async (player) => {
    player.filters.qualityBoost = true;
    player.filters.volumeNormalized = true;
    player._filterPreset = 'clarity';
  });

  return client.riffy;
}

export function formatTime(ms) {
  if (!ms || isNaN(ms)) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const secStr = String(secs).padStart(2, '0');
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${secStr}`;
  return `${mins}:${secStr}`;
}
