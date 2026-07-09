import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'rpc';
export const description = 'View a user\'s Rich Presence (activity) status.';
export const usage = 'rpc [@user]';
export const aliases = ['presence', 'activity', 'status'];

export async function execute(message, args) {
  const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
  const presence = target.presence;

  if (!presence || !presence.activities.length) {
    await reply(message, `${emojis.info} **${target.displayName}** has no active status.`);
    return;
  }

  const typeNames = { 0: 'Playing', 1: 'Streaming', 2: 'Listening', 3: 'Watching', 4: 'Custom', 5: 'Competing' };

  for (const activity of presence.activities) {
    const type = typeNames[activity.type] || 'Activity';
    const lines = [`╭── ${type} ──────────────────────╮`];

    if (activity.name) lines.push(`│ Game        :: ${activity.name}`);
    if (activity.details) lines.push(`│ Details     :: ${activity.details}`);
    if (activity.state) lines.push(`│ State       :: ${activity.state}`);

    if (activity.timestamps?.start) {
      const elapsed = Math.floor((Date.now() - activity.timestamps.start) / 1000);
      const hh = Math.floor(elapsed / 3600);
      const mm = Math.floor((elapsed % 3600) / 60);
      const ss = elapsed % 60;
      lines.push(`│ Elapsed     :: ${hh > 0 ? `${hh}h ` : ''}${mm}m ${ss}s`);
    }

    if (activity.assets?.largeText) lines.push(`│ Asset       :: ${activity.assets.largeText}`);
    if (activity.party?.size) lines.push(`│ Party       :: ${activity.party.size[0]}/${activity.party.size[1]}`);

    lines.push(`╰────────────────────────────────╯`);

    let thumb = null;
    try {
      thumb = activity.assets?.largeImageURL({ size: 256, extension: 'webp' });
    } catch {}

    const embed = new EmbedBuilder()
      .setDescription(`\`\`\`\n${lines.join('\n')}\n\`\`\``)
      .setColor(0x2B2D31);

    if (thumb) embed.setThumbnail(thumb);

    await message.channel.send({ embeds: [embed] });
  }
}
