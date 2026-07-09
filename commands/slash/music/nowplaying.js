import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { formatTime } from '../../../util/riffy.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('nowplaying')
  .setDescription('Show the currently playing track');

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

  const track = player.current;
  const lines = [
    `${emojis.play} **Now Playing:**`,
    `**Title:** ${track.info.title}`,
    `**Author:** ${track.info.author}`,
    `**Duration:** \`${formatTime(player.position)} / ${formatTime(track.info.length)}\``,
    `**Volume:** ${player.volume}%`,
  ];

  if (track.info.uri) lines.push(`**URL:** ${track.info.uri}`);

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

  await interaction.reply({ content: lines.join('\n'), components: [row] });
  const reply = await interaction.fetchReply();

  const collector = reply.createMessageComponentCollector({
    filter: i => i.user.id === interaction.user.id,
    time: 300000,
  });

  collector.on('collect', async i => {
    const p = interaction.client.riffy?.players.get(interaction.guild.id);
    if (!p || !p.current) {
      await i.update({ components: [] });
      collector.stop();
      return;
    }

    switch (i.customId) {
      case 'np_prev': {
        await i.reply({ content: `${emojis.warning} No previous track available.`, flags: MessageFlags.Ephemeral });
        break;
      }
      case 'np_pause': {
        p.pause(!p.paused);
        await i.update({ components: [buildRow(p.paused)] });
        break;
      }
      case 'np_skip': {
        p.stop();
        await i.reply({ content: `${emojis.skip} Skipped.`, flags: MessageFlags.Ephemeral });
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
    reply.edit({ components: [] }).catch(() => {});
  });
}
