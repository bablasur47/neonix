import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { formatTime } from '../../../util/riffy.js';

export const name = 'nowplaying';
export const aliases = ['np', 'now'];
export const description = 'Show the currently playing track';
export const usage = 'nowplaying';

export async function execute(message) {
  if (!message.client.riffy) {
    await reply(message, `${emojis.error} Music system is not connected.`);
    return;
  }
  const player = message.client.riffy.players.get(message.guild.id);
  if (!player || !player.current) {
    await reply(message, `${emojis.error} No music is playing.`);
    return;
  }

const track = player.current;

function buildRow(paused) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('np_prev')
      .setEmoji(emojis.prev)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('np_pause')
      .setEmoji(paused ? emojis.play : emojis.pause)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('np_skip')
      .setEmoji(emojis.skip)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('np_stop')
      .setEmoji(emojis.stop)
      .setStyle(ButtonStyle.Secondary),
  );
}

const row = buildRow(player.paused);

  let sent;

  try {
    const { initializeFonts, Bloom } = await import('musicard');
    await initializeFonts();

    const timeStart = formatTime(player.position);
    const timeEnd = track.info.isStream ? 'LIVE' : formatTime(track.info.length);
    const progress = track.info.isStream ? 0 : Math.round((player.position / track.info.length) * 100);
    const thumb = track.info.thumbnail;
    const artwork = track.info.artworkUrl || (thumb instanceof Promise ? await thumb : thumb) || undefined;

    const card = await Bloom({
      trackName: track.info.title || 'Unknown',
      artistName: track.info.author || 'Unknown',
      albumArt: artwork,
      timeAdjust: { timeStart, timeEnd },
      progressBar: progress,
      volumeBar: player.volume,
    });

    sent = await message.channel.send({ files: [{ attachment: card, name: 'track.png' }], components: [row] });
  } catch {
    const timeEnd = track.info.isStream ? 'LIVE' : formatTime(track.info.length);
    const progress = track.info.isStream ? 0 : Math.round((player.position / track.info.length) * 100);
    const bar = '█'.repeat(Math.round(progress / 10)) + '░'.repeat(10 - Math.round(progress / 10));
    sent = await message.channel.send({
      content:
        `**Now Playing:** ${track.info.title} — ${track.info.author}\n` +
        `${bar} **${formatTime(player.position)} / ${timeEnd}**\n` +
        `Volume: **${player.volume}%**`,
      components: [row],
    });
  }

  const collector = sent.createMessageComponentCollector({
    filter: i => i.user.id === message.author.id,
    time: 300000,
  });

  collector.on('collect', async i => {
    const p = message.client.riffy?.players.get(message.guild.id);
    if (!p || !p.current) {
      await i.update({ components: [] });
      collector.stop();
      return;
    }

    switch (i.customId) {
      case 'np_prev': {
        await i.reply({ content: `${emojis.warning} No previous track available.`, flags: 64 });
        break;
      }
      case 'np_pause': {
        p.pause(!p.paused);
        await i.update({ components: [buildRow(p.paused)] });
        break;
      }
      case 'np_skip': {
        p.stop();
        await i.reply({ content: `${emojis.skip} Skipped.`, flags: 64 });
        if (!p.queue.length) {
          await i.message.edit({ components: [] });
          collector.stop();
        }
        break;
      }
      case 'np_stop': {
        p.queue.clear();
        p.stop();
        p.destroy();
        await i.update({ components: [] });
        collector.stop();
        break;
      }
    }
  });

  collector.on('end', () => {
    sent.edit({ components: [] }).catch(() => {});
  });
}
