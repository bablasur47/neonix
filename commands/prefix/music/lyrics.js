import { EmbedBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';
import { formatTime } from '../../../util/riffy.js';

export const name = 'lyrics';
export const aliases = ['ly'];
export const description = 'Show live synced lyrics for the currently playing track.';
export const usage = 'lyrics';

export async function execute(message, args) {
  const riffy = message.client.riffy;
  if (!riffy) {
    await message.reply(`${emojis.error} Music system is not connected.`);
    return;
  }

  const player = riffy.players.get(message.guild.id);
  if (!player || !player.current) {
    await message.reply(`${emojis.error} No music is playing.`);
    return;
  }

  const node = player.node;
  if (!node) {
    await message.reply(`${emojis.error} No Lavalink node available.`);
    return;
  }

  const protocol = node.secure ? 'https' : 'http';
  const restUrl = `${protocol}://${node.host}:${node.port}`;
  const sessionId = node.sessionId;

  if (!sessionId) {
    await message.reply(`${emojis.error} Lavalink node session not ready.`);
    return;
  }

  let data;
  try {
    const res = await fetch(
      `${restUrl}/v4/sessions/${sessionId}/players/${message.guild.id}/track/lyrics`,
      { headers: { Authorization: node.password }, signal: AbortSignal.timeout(8000) }
    );
    if (res.status === 404) {
      await message.reply(`${emojis.warning} No lyrics available for **${player.current.info.title}**.`);
      return;
    }
    if (!res.ok) {
      await message.reply(`${emojis.error} Failed to fetch lyrics (HTTP ${res.status}).`);
      return;
    }
    data = await res.json();
  } catch {
    await message.reply(`${emojis.error} Failed to fetch lyrics. Is the LavaLyrics plugin installed on your Lavalink server?`);
    return;
  }

  if (!data || (!data.text && !data.lines?.length)) {
    await message.reply(`${emojis.warning} No lyrics available for **${player.current.info.title}**.`);
    return;
  }

  const track = player.current;
  const rawLines = data.lines;
  const isStringArray = rawLines?.length > 0 && typeof rawLines[0] === 'string';

  const lines = isStringArray
    ? rawLines.map(l => ({ line: l, timestamp: null }))
    : rawLines || [];

  const hasTimestamps = lines.some(l => l.timestamp != null);

  if (!hasTimestamps) {
    const text = data.text || lines.map(l => l.line).join('\n');
    if (!text) {
      await message.reply(`${emojis.warning} No lyrics available for **${track.info.title}**.`);
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(0x2B2D31)
      .setTitle(`${track.info.title} — ${track.info.author}`)
      .setThumbnail(typeof track.info.thumbnail === 'string' ? track.info.thumbnail : (typeof track.info.artworkUrl === 'string' ? track.info.artworkUrl : null))
      .setDescription(text.slice(0, 4096))
      .setFooter({ text: `Source: ${data.sourceName || 'Unknown'} (unsynced)` });
    await message.reply({ embeds: [embed] });
    return;
  }

  const msg = await message.reply({ embeds: [makeLyricsEmbed(track, lines, 0, data.sourceName)] });

  const interval = setInterval(async () => {
    const p = riffy.players.get(message.guild.id);
    if (!p || !p.current || p.current.track !== track.track) {
      clearInterval(interval);
      return;
    }
    const pos = p.position || 0;
    let currentIdx = 0;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].timestamp != null && pos >= lines[i].timestamp) {
        currentIdx = i;
        break;
      }
    }
    try {
      await msg.edit({ embeds: [makeLyricsEmbed(track, lines, currentIdx, data.sourceName)] });
    } catch {
      clearInterval(interval);
    }
  }, 1500);

  setTimeout(() => clearInterval(interval), track.info.length + 10000);
}

function makeLyricsEmbed(track, lines, activeIdx, sourceName) {
  const windowStart = Math.max(0, activeIdx - 4);
  const windowLines = lines.slice(windowStart, windowStart + 14);

  const desc = windowLines.map((l, i) => {
    const globalIdx = windowStart + i;
    if (globalIdx === activeIdx) return `**→ ${l.line}**`;
    if (l.timestamp != null && globalIdx < activeIdx) return `~~${l.line}~~`;
    return l.line;
  }).join('\n');

  const progress = track.info.length > 0
    ? `${formatTime(lines[activeIdx]?.timestamp || 0)} / ${formatTime(track.info.length)}`
    : '';

  return new EmbedBuilder()
    .setColor(0x2B2D31)
    .setTitle(`${track.info.title} — ${track.info.author}`)
    .setURL(track.info.uri || null)
    .setThumbnail(typeof track.info.thumbnail === 'string' ? track.info.thumbnail : (typeof track.info.artworkUrl === 'string' ? track.info.artworkUrl : null))
    .setDescription(desc || 'No lyrics lines.')
    .setFooter({ text: `Source: ${sourceName || 'Unknown'}${progress ? ` • ${progress}` : ''}` });
}
