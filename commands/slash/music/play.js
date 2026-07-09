import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';
import { formatTime } from '../../../util/riffy.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song or playlist from YouTube/Spotify/SoundCloud')
  .addStringOption(opt =>
    opt.setName('query').setDescription('Song name or URL').setRequired(true)
  );

export async function execute(interaction) {
  const voice = interaction.member.voice.channel;
  if (!voice) {
    await interaction.reply({ content: `${emojis.error} You must be in a voice channel.`, flags: MessageFlags.Ephemeral });
    return;
  }

  const query = interaction.options.getString('query', true);
  const riffy = interaction.client.riffy;
  if (!riffy) {
    await interaction.reply({ content: `${emojis.error} Music system is not connected.`, flags: MessageFlags.Ephemeral });
    return;
  }

  if (!riffy.leastUsedNodes.length) {
    await interaction.reply({ content: `${emojis.error} No Lavalink node available. Check your \`LAVALINK_HOST\` / \`LAVALINK_NODES\` env vars or try again later.`, flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.deferReply();

  const player = riffy.createConnection({
    guildId: interaction.guild.id,
    voiceChannel: voice.id,
    textChannel: interaction.channel.id,
    deaf: true,
  });

  const resolve = await riffy.resolve({ query, requester: interaction.user });
  const { loadType, tracks, playlistInfo } = resolve;

  if (loadType === 'error' || loadType === 'empty' || !tracks?.length) {
    await interaction.editReply(`${emojis.error} No results found for \`${query}\`.`);
    return;
  }

  if (loadType === 'playlist') {
    for (const track of tracks) {
      track.info.requester = interaction.user;
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
    await interaction.editReply(`${emojis.success} Added **${tracks.length}** tracks from playlist **${playlistInfo.name}**`);
    return;
  }

  const track = tracks.shift();
  track.info.requester = interaction.user;
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
    await interaction.editReply(`${emojis.play} Playing **${track.info.title}** by **${track.info.author}** (\`${formatTime(track.info.length)}\`)`);
  } else {
    await interaction.editReply(`${emojis.queue} Added **${track.info.title}** to queue (position #${player.queue.size})`);
  }
}
