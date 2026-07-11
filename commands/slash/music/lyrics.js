import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';
import { formatTime } from '../../../util/riffy.js';

export const data = new SlashCommandBuilder()
  .setName('lyrics')
  .setDescription('Show live synced lyrics for the currently playing track');

export async function execute(interaction) {
  const riffy = interaction.client.riffy;
  if (!riffy) {
    await interaction.reply({ content: `${emojis.error} Music system is not connected.`, flags: MessageFlags.Ephemeral });
    return;
  }

  const player = riffy.players.get(interaction.guild.id);
  if (!player || !player.current) {
    await interaction.reply({ content: `${emojis.error} No music is playing.`, flags: MessageFlags.Ephemeral });
    return;
  }

  const node = player.node;
  if (!node) {
    await interaction.reply({ content: `${emojis.error} No Lavalink node available.`, flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.deferReply();

  let data;
  try {
    data = await node.lyrics.getCurrentTrack(interaction.guild.id);
  } catch {
    await interaction.editReply(`${emojis.error} Failed to fetch lyrics. Is the LavaLyrics plugin installed?`);
    return;
  }

  if (!data) {
    await interaction.editReply(`${emojis.warning} No lyrics available for **${player.current.info.title}**.`);
    return;
  }

  const track = player.current;
  const lines = data.lines;
  const hasTimestamps = lines?.length > 0 && lines.some(l => l.timestamp != null);

  if (!hasTimestamps) {
    const text = data.text || lines?.map(l => l.line).join('\n');
    if (!text) {
      await interaction.editReply(`${emojis.warning} No lyrics available for **${track.info.title}**.`);
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(0x2B2D31)
      .setTitle(`${track.info.title} — ${track.info.author}`)
      .setThumbnail(track.info.thumbnail || track.info.artworkUrl || null)
      .setDescription(text.slice(0, 4096))
      .setFooter({ text: `Source: ${data.sourceName || 'Unknown'} (unsynced)` });
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  const msg = await interaction.editReply({ embeds: [makeLyricsEmbed(track, lines, 0, data.sourceName)] });

  const interval = setInterval(async () => {
    const p = riffy.players.get(interaction.guild.id);
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
    .setThumbnail(track.info.thumbnail || track.info.artworkUrl || null)
    .setDescription(desc || 'No lyrics lines.')
    .setFooter({ text: `Source: ${sourceName || 'Unknown'}${progress ? ` • ${progress}` : ''}` });
}
