import { ActionRowBuilder, ComponentType, MessageFlags, SlashCommandBuilder, StringSelectMenuBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';
import { formatTime } from '../../../util/riffy.js';

export const data = new SlashCommandBuilder()
  .setName('search')
  .setDescription('Search for a song and select from results')
  .addStringOption(opt =>
    opt.setName('query').setDescription('Song name to search').setRequired(true)
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

  const resolve = await riffy.resolve({ query, requester: interaction.user });
  const { loadType, tracks } = resolve;

  if (loadType === 'error' || loadType === 'empty' || !tracks?.length) {
    await interaction.editReply(`${emojis.error} No results found for \`${query}\`.`);
    return;
  }

  const results = tracks.slice(0, 10);

  const select = new StringSelectMenuBuilder()
    .setCustomId('search_select')
    .setPlaceholder('Select a song to play')
    .addOptions(
      results.map((t, i) => ({
        label: t.info.title.substring(0, 100),
        value: i.toString(),
        description: `${t.info.author} — ${formatTime(t.info.length)}`.substring(0, 100),
      }))
    );

  const row = new ActionRowBuilder().addComponents(select);

  const reply = await interaction.editReply({
    content: `${emojis.search} **Search results for \`${query}\`:**`,
    components: [row],
  });

  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 30000,
    filter: i => i.user.id === interaction.user.id,
  });

  collector.on('collect', async (i) => {
    await i.deferUpdate();
    collector.stop();

    const index = parseInt(i.values[0]);
    const track = results[index];
    track.info.requester = interaction.user;

    const player = riffy.createConnection({
      guildId: interaction.guild.id,
      voiceChannel: voice.id,
      textChannel: interaction.channel.id,
      deaf: true,
    });

    player.queue.add(track);

    if (!player.playing && !player.paused) {
      try {
        await player.play();
      } catch {
        player.queue.add(track);
        await player.play();
      }
    }

    const pos = player.queue.indexOf(track) + 1;
    await interaction.editReply({
      content: player.playing
        ? `${emojis.play} Playing **${track.info.title}** by **${track.info.author}** (\`${formatTime(track.info.length)}\`)`
        : `${emojis.queue} Added **${track.info.title}** to queue (position #${player.queue.size})`,
      components: [],
    });
  });

  collector.on('end', async (collected, reason) => {
    if (reason === 'time' && collected.size === 0) {
      await interaction.editReply({ content: `${emojis.warning} Search timed out.`, components: [] });
    }
  });
}
