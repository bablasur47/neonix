import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import config from '../../../util/config.js';

const DEFAULT_VOLUME = config.defaultVolume || 65;

const CRYSTAL_EQ = [
  { band: 0, gain: 0.0 }, { band: 1, gain: 0.04 }, { band: 2, gain: 0.06 },
  { band: 3, gain: 0.02 }, { band: 4, gain: -0.05 }, { band: 5, gain: -0.10 },
  { band: 6, gain: -0.12 }, { band: 7, gain: -0.08 }, { band: 8, gain: 0.0 },
  { band: 9, gain: 0.05 }, { band: 10, gain: 0.08 }, { band: 11, gain: 0.06 },
  { band: 12, gain: 0.04 }, { band: 13, gain: 0.02 }, { band: 14, gain: -0.02 },
];

export const name = 'filters';
export const aliases = ['filter', 'eq', 'sound'];
export const description = 'Apply audio filters & quality presets';
export const usage = 'filters <preset|subcommand>';

const presets = {
  clarity: {
    desc: 'Crystal-clean preset (default) — cuts mud, clear vocals, airy highs',
    apply: async (p) => {
      await p.filters.setEqualizer(CRYSTAL_EQ).catch(() => {});
      await p.filters.setChannelMix(true, { leftToLeft: 0.70, leftToRight: 0.30, rightToLeft: 0.30, rightToRight: 0.70 }).catch(() => {});
    },
  },
  bass: {
    desc: 'Clean bass boost — tight low end, no mud',
    apply: async (p) => {
      await p.filters.setEqualizer([
        { band: 0, gain: 0.20 }, { band: 1, gain: 0.25 }, { band: 2, gain: 0.20 },
        { band: 3, gain: 0.10 }, { band: 4, gain: 0.0 }, { band: 5, gain: -0.08 },
        { band: 6, gain: -0.10 }, { band: 7, gain: -0.05 }, { band: 8, gain: 0.0 },
        { band: 9, gain: 0.04 }, { band: 10, gain: 0.06 }, { band: 11, gain: 0.04 },
        { band: 12, gain: 0.02 }, { band: 13, gain: 0.0 }, { band: 14, gain: -0.02 }
      ]).catch(() => {});
    },
  },
  treble: {
    desc: 'Clean treble boost — crisp highs, no harshness',
    apply: async (p) => {
      await p.filters.setEqualizer([
        { band: 0, gain: -0.05 }, { band: 1, gain: 0.0 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.0 }, { band: 4, gain: 0.0 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.02 }, { band: 7, gain: 0.05 }, { band: 8, gain: 0.10 },
        { band: 9, gain: 0.15 }, { band: 10, gain: 0.20 }, { band: 11, gain: 0.15 },
        { band: 12, gain: 0.10 }, { band: 13, gain: 0.05 }, { band: 14, gain: 0.0 }
      ]).catch(() => {});
    },
  },
  earrape: {
    desc: 'Maximum loudness (use with caution)',
    apply: async (p) => {
      await p.filters.clearFilters().catch(() => {});
      p.setVolume(150);
      await p.filters.setEqualizer([
        { band: 0, gain: 0.5 }, { band: 1, gain: 0.5 }, { band: 2, gain: 0.5 },
        { band: 3, gain: 0.5 }, { band: 4, gain: 0.5 }, { band: 5, gain: 0.5 },
        { band: 6, gain: 0.5 }, { band: 7, gain: 0.5 }, { band: 8, gain: 0.5 },
        { band: 9, gain: 0.5 }, { band: 10, gain: 0.5 }, { band: 11, gain: 0.5 },
        { band: 12, gain: 0.5 }, { band: 13, gain: 0.5 }, { band: 14, gain: 0.5 }
      ]).catch(() => {});
    },
  },
};

export async function execute(message, args) {
  if (!message.client.riffy) {
    await reply(message, `${emojis.error} Music system is not connected.`);
    return;
  }
  const player = message.client.riffy.players.get(message.guild.id);
  if (!player) {
    await reply(message, `${emojis.error} No music is playing.`);
    return;
  }

  const sub = args[0]?.toLowerCase();

  if (!sub || sub === 'list') {
    let list = `${emojis.info} **Sound Presets:**\n`;
    for (const [name, p] of Object.entries(presets)) {
      list += `\`${name}\` — ${p.desc}\n`;
    }
    list += `\n**Effects:**\n\`bassboost <1-5>\` — Manual bass boost\n\`nightcore\` — Faster + higher pitch\n\`vaporwave\` — Slower + lower pitch\n\`8d\` — 8D rotation effect\n\`slowmo\` — Slow motion\n\`clear\` — Reset all filters\n\`volume <0-200>\` — Adjust playback volume`;
    await reply(message, list);
    return;
  }

  if (sub === 'volume') {
    const vol = Math.min(Math.max(parseInt(args[1]) || DEFAULT_VOLUME, 0), 200);
    player.setVolume(vol);
    await reply(message, `${emojis.volume} Volume set to **${vol}%**.`);
    return;
  }

  if (presets[sub]) {
    try {
      await presets[sub].apply(player);
      await reply(message, `${emojis.success} **${sub}** preset applied.`);
    } catch {
      await reply(message, `${emojis.error} Failed to apply **${sub}** preset.`);
    }
    return;
  }

  if (sub === 'bassboost') {
    const value = Math.min(Math.max(parseInt(args[1]) || 1, 1), 5);
    player.filters.setBassboost(true, { value });
    await reply(message, `${emojis.success} Bassboost set to **${value}**.`);
    return;
  }

  if (sub === 'nightcore') {
    player.filters.setNightcore(true);
    await reply(message, `${emojis.success} Nightcore enabled.`);
    return;
  }

  if (sub === 'vaporwave') {
    player.filters.setVaporwave(true);
    await reply(message, `${emojis.success} Vaporwave enabled.`);
    return;
  }

  if (sub === '8d') {
    player.filters.set8D(true);
    await reply(message, `${emojis.success} 8D enabled.`);
    return;
  }

  if (sub === 'slowmo') {
    player.filters.setSlowmode(true);
    await reply(message, `${emojis.success} Slowmo enabled.`);
    return;
  }

  if (sub === 'clear') {
    await player.filters.clearFilters();
    await reply(message, `${emojis.success} All filters cleared. Run \`filters clarity\` to re-enable quality enhancement.`);
    return;
  }

  await reply(message, `${emojis.warning} Unknown filter. Use \`filters list\` to see all options.`);
}
