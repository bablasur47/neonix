import { StringSelectMenuBuilder, ActionRowBuilder, ComponentType } from 'discord.js';
import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { formatTime } from '../../../util/riffy.js';

export const name = 'search';
export const description = 'Search for a song and select from results.';
export const usage = 'search <query>';
export const aliases = ['find'];

export async function execute(message, args) {
  const voice = message.member.voice.channel;
  if (!voice) {
    await reply(message, `${emojis.error} You must be in a voice channel.`);
    return;
  }

  const query = args.join(' ');
  if (!query) {
    await reply(message, `${emojis.warning} Usage: \`search <song name>\``);
    return;
  }

  const riffy = message.client.riffy;
  if (!riffy) {
    await reply(message, `${emojis.error} Music system is not connected.`);
    return;
  }
  if (!riffy.leastUsedNodes.length) {
    await reply(message, `${emojis.error} No Lavalink node available. Check your \`LAVALINK_HOST\` / \`LAVALINK_NODES\` env vars or try again later.`);
    return;
  }

  const status = await reply(message, `${emojis.search} Searching for \`${query}\`...`);

  const resolve = await riffy.resolve({ query, requester: message.author });
  const { loadType, tracks } = resolve;

  if (loadType === 'error' || loadType === 'empty' || !tracks?.length) {
    await status.edit(`${emojis.error} No results found for \`${query}\`.`);
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

  const msg = await status.edit({
    content: `${emojis.search} **Search results for \`${query}\`:**`,
    components: [row],
  });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 30000,
    filter: i => i.user.id === message.author.id,
  });

  collector.on('collect', async (i) => {
    await i.deferUpdate();
    collector.stop();

    const index = parseInt(i.values[0]);
    const track = results[index];
    track.info.requester = message.author;

    const player = riffy.createConnection({
      guildId: message.guild.id,
      voiceChannel: voice.id,
      textChannel: message.channel.id,
      deaf: true,
    });

    player.queue.add(track);

    if (!player.playing && !player.paused) {
      try {
        await player.play();
      } catch {
        player.queue.add(track);
        try { await player.play(); } catch {}
      }
    }

    await msg.edit({
      content: player.playing
        ? `${emojis.play} Playing **${track.info.title}** by **${track.info.author}** (\`${formatTime(track.info.length)}\`)`
        : `${emojis.queue} Added **${track.info.title}** to queue (position #${player.queue.size})`,
      components: [],
    });
  });

  collector.on('end', async (collected, reason) => {
    if (reason === 'time' && collected.size === 0) {
      await msg.edit({ content: `${emojis.warning} Search timed out.`, components: [] });
    }
  });
}
