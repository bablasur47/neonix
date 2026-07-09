import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { formatTime } from '../../../util/riffy.js';

const PAGE_SIZE = 5;
const ACCENT = 0x2B2D31;

export const name = 'queue';
export const aliases = ['q'];
export const description = 'Show the current music queue';
export const usage = 'queue';

function buildQueueEmbed(player, page) {
  const current = player.current;
  const tracks = player.queue;
  const totalPages = Math.max(1, Math.ceil(tracks.length / PAGE_SIZE));
  const p = Math.min(page, totalPages - 1);
  const start = p * PAGE_SIZE;
  const slice = tracks.slice(start, start + PAGE_SIZE);

  const lines = [];
  if (current) {
    lines.push(`${emojis.play} **Now Playing:** [${current.info.title}](${current.info.uri}) — ${current.info.author} (\`${formatTime(player.position)} / ${formatTime(current.info.isStream ? 0 : current.info.length)}\`)`);
    lines.push('');
  }
  if (slice.length === 0) {
    lines.push('*Queue is empty.*');
  } else {
    slice.forEach((t, i) => {
      const num = start + i + 1;
      lines.push(`\`#${String(num).padStart(2, ' ')}\` [${t.info.title}](${t.info.uri}) — ${t.info.author} (\`${formatTime(t.info.length)}\`)`);
    });
  }
  if (tracks.length > PAGE_SIZE) {
    lines.push('');
    lines.push(`Page **${p + 1}**/${totalPages} · **${tracks.length}** tracks total`);
  } else if (tracks.length > 0) {
    lines.push('');
    lines.push(`**${tracks.length}** track(s) in queue`);
  }
  lines.push(`Volume: **${player.volume}%**${player.isAutoplay ? ' · Autoplay: On' : ''}`);
  return { embeds: [{ description: lines.join('\n'), color: ACCENT }] };
}

function buildNavComponents(player, page) {
  const tracks = player.queue;
  const totalPages = Math.max(1, Math.ceil(tracks.length / PAGE_SIZE));
  const p = Math.min(page, totalPages - 1);
  const start = p * PAGE_SIZE;
  const slice = tracks.slice(start, start + PAGE_SIZE);

  const rows = [];

  if (slice.length > 0) {
    const select = new StringSelectMenuBuilder()
      .setCustomId('q_select')
      .setPlaceholder('Select a track to manage...')
      .addOptions(slice.map((t, i) => ({
        label: `${start + i + 1}. ${(t.info.title || 'Unknown').slice(0, 90)}`,
        value: String(start + i),
        description: t.info.author?.slice(0, 100) || undefined,
      })));
    rows.push(new ActionRowBuilder().addComponents(select));
  }

  if (totalPages > 1) {
    rows.push(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('q_prev').setEmoji('◀️').setStyle(ButtonStyle.Secondary).setDisabled(p === 0),
      new ButtonBuilder().setCustomId('q_page').setLabel(`${p + 1}/${totalPages}`).setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId('q_next').setEmoji('▶️').setStyle(ButtonStyle.Secondary).setDisabled(p >= totalPages - 1),
    ));
  } else {
    rows.push(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('q_refresh').setEmoji('🔄').setStyle(ButtonStyle.Secondary),
    ));
  }

  return rows;
}

export async function execute(message) {
  if (!message.client.riffy) {
    await reply(message, `${emojis.error} Music system is not connected.`);
    return;
  }
  const player = message.client.riffy.players.get(message.guild.id);
  if (!player) {
    await reply(message, `${emojis.error} No music is playing.`);
    return;
  }

  let page = 0;
  const msg = await message.reply({ ...buildQueueEmbed(player, page), components: buildNavComponents(player, page) });

  const collector = msg.createMessageComponentCollector({ time: 120000 });

  collector.on('collect', async (i) => {
    if (i.user.id !== message.author.id) {
      await i.reply({ content: `${emojis.warning} Not your queue session.`, ephemeral: true });
      return;
    }

    if (i.isButton()) {
      if (i.customId === 'q_prev') {
        page = Math.max(0, page - 1);
        await i.deferUpdate();
        await msg.edit({ ...buildQueueEmbed(player, page), components: buildNavComponents(player, page) }).catch(() => {});
        return;
      }
      if (i.customId === 'q_next') {
        page = Math.min(Math.ceil(player.queue.length / PAGE_SIZE) - 1, page + 1);
        await i.deferUpdate();
        await msg.edit({ ...buildQueueEmbed(player, page), components: buildNavComponents(player, page) }).catch(() => {});
        return;
      }
      if (i.customId === 'q_refresh') {
        await i.deferUpdate();
        await msg.edit({ ...buildQueueEmbed(player, page), components: buildNavComponents(player, page) }).catch(() => {});
        return;
      }
      if (i.customId === 'q_cancel') {
        await i.deferUpdate();
        await msg.edit({ ...buildQueueEmbed(player, page), components: buildNavComponents(player, page) }).catch(() => {});
        return;
      }

      const parts = i.customId.split('_');
      const action = parts[0] === 'q' ? parts[1] : null;
      const idx = parseInt(parts[2]);
      if (!action || isNaN(idx) || idx < 0 || idx >= player.queue.length) {
        await i.deferUpdate().catch(() => {});
        return;
      }
      const track = player.queue[idx];
      const trackName = track?.info?.title || 'Unknown';

      await i.deferUpdate();

      if (action === 'mvup' && idx > 0) {
        const newQueue = [...player.queue];
        const [t] = newQueue.splice(idx, 1);
        newQueue.splice(idx - 1, 0, t);
        player.queue.splice(0, player.queue.length, ...newQueue);
        page = 0;
        await msg.edit({ ...buildQueueEmbed(player, page), components: buildNavComponents(player, page) }).catch(() => {});
      } else if (action === 'mvdn' && idx < player.queue.length - 1) {
        const newQueue = [...player.queue];
        const [t] = newQueue.splice(idx, 1);
        newQueue.splice(idx + 1, 0, t);
        player.queue.splice(0, player.queue.length, ...newQueue);
        page = 0;
        await msg.edit({ ...buildQueueEmbed(player, page), components: buildNavComponents(player, page) }).catch(() => {});
      } else if (action === 'rm') {
        player.queue.splice(idx, 1);
        page = 0;
        await msg.edit({ ...buildQueueEmbed(player, page), components: buildNavComponents(player, page) }).catch(() => {});
      } else if (action === 'jump' && player.queue.length > 0 && idx >= 0) {
        const [t] = player.queue.splice(idx, 1);
        player.queue.unshift(t);
        try { await player.stop(); } catch {}
        page = 0;
        await msg.edit({ embeds: [{ description: `${emojis.success} Skipping to **${trackName}**...`, color: ACCENT }], components: [] }).catch(() => {});
      }
      return;
    }

    if (i.isStringSelectMenu() && i.customId === 'q_select') {
      const trackIdx = parseInt(i.values[0]);
      if (isNaN(trackIdx) || trackIdx < 0 || trackIdx >= player.queue.length) {
        await i.reply({ content: `${emojis.error} Invalid track.`, ephemeral: true });
        return;
      }

      const track = player.queue[trackIdx];
      const trackName = track?.info?.title || 'Unknown';

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`q_mvup_${trackIdx}`).setEmoji('⬆️').setLabel('Move Up').setStyle(ButtonStyle.Primary).setDisabled(trackIdx === 0),
        new ButtonBuilder().setCustomId(`q_mvdn_${trackIdx}`).setEmoji('⬇️').setLabel('Move Down').setStyle(ButtonStyle.Primary).setDisabled(trackIdx >= player.queue.length - 1),
        new ButtonBuilder().setCustomId(`q_rm_${trackIdx}`).setEmoji('❌').setLabel('Remove').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`q_jump_${trackIdx}`).setEmoji('▶️').setLabel('Play Now').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('q_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary),
      );

      /* Replace the main message with action buttons */
      await i.update({
        embeds: [{ description: `**Selected #${trackIdx + 1}:** [${trackName}](${track.info.uri})\nChoose an action:`, color: ACCENT }],
        components: [actionRow],
      });
      return;
    }
  });

  collector.on('end', () => {
    try { msg.edit({ components: [] }).catch(() => {}); } catch {}
  });
}
