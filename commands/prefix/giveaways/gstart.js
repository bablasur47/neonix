import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'gstart';
export const description = 'Start a giveaway.';
export const usage = 'gstart <duration> [winners] <prize> [--reqr @role] [--byp @role]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  if (args.length < 2) {
    await reply(message, `${emojis.warning} Usage: \`gstart 1h [2] Nitro Classic [--reqr @role] [--byp @role]\``);
    return;
  }

  const durationStr = args[0].toLowerCase();
  const durationMatch = durationStr.match(/^(\d+)(s|m|h|d)$/);
  if (!durationMatch) {
    await reply(message, `${emojis.warning} Invalid duration. Use e.g. \`30s\`, \`5m\`, \`1h\`, \`2d\``);
    return;
  }

  const value = parseInt(durationMatch[1]);
  const unit = durationMatch[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const durationMs = value * multipliers[unit];

  let winnerCount = 1;
  let prizeStart = 1;

  const second = parseInt(args[1]);
  if (!isNaN(second) && second > 0 && second <= 100) {
    winnerCount = second;
    prizeStart = 2;
  }

  let prizeArgs = args.slice(prizeStart);
  let requiredRole = null;
  let bypassRole = null;

  const reqrIdx = prizeArgs.findIndex(a => a === '--reqr');
  if (reqrIdx !== -1) {
    const roleMention = prizeArgs[reqrIdx + 1];
    if (roleMention) {
      const roleId = roleMention.replace(/<@&(\d+)>/, '$1');
      const role = message.guild.roles.cache.get(roleId);
      if (role) requiredRole = role.id;
    }
    prizeArgs = prizeArgs.slice(0, reqrIdx);
  }

  const bypIdx = prizeArgs.findIndex(a => a === '--byp');
  if (bypIdx !== -1) {
    const roleMention = prizeArgs[bypIdx + 1];
    if (roleMention) {
      const roleId = roleMention.replace(/<@&(\d+)>/, '$1');
      const role = message.guild.roles.cache.get(roleId);
      if (role) bypassRole = role.id;
    }
    prizeArgs = prizeArgs.slice(0, bypIdx);
  }

  const prize = prizeArgs.join(' ');
  if (!prize) {
    await reply(message, `${emojis.warning} Provide a prize name.`);
    return;
  }

  const endsAt = new Date(Date.now() + durationMs).toISOString();
  const endUnix = Math.floor((Date.now() + durationMs) / 1000);
  const imageUrl = message.attachments.first()?.url || null;

  const desc = [
    `${emojis.gift} **${prize}**`,
    '',
    `Winners: **${winnerCount}**`,
    `Ends: <t:${endUnix}:R> (<t:${endUnix}:f>)`,
    `Hosted by: ${message.author}`,
  ];

  if (requiredRole) {
    desc.push(`Required role: <@&${requiredRole}>`);
  }
  if (bypassRole) {
   desc.push(`Bypass role: <@&${bypassRole}>`);
   }
   desc.push('', 'Click the button below to enter!');

   const embed = new EmbedBuilder()
     .setColor(0x2B2D31)
     .setDescription(desc.join('\n'))
     .setThumbnail(message.guild.iconURL({ size: 256 }));

   if (imageUrl) embed.setImage(imageUrl);

   const enterButton = new ButtonBuilder()
     .setCustomId('giveaway_enter')
     .setLabel('🎉 Enter Giveaway')
     .setStyle(ButtonStyle.Primary);

   const actionRow = new ActionRowBuilder().addComponents(enterButton);

   const giveawayMsg = await message.channel.send({ embeds: [embed], components: [actionRow] });

   const db = getDb('giveaways');
   db.run(
     'INSERT INTO giveaways (guild_id, channel_id, message_id, prize, winners, ends_at, host_id, required_role, bypass_role, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
     [message.guild.id, message.channel.id, giveawayMsg.id, prize, winnerCount, endsAt, message.author.id, requiredRole, bypassRole, imageUrl]
   );

  await reply(message, `${emojis.success} Giveaway started! Prize: **${prize}**`);
}
