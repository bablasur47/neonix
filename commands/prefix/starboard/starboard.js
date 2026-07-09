import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { PermissionsBitField } from 'discord.js';

export const name = 'starboard';
export const aliases = ['sb'];
export const description = 'Manage the starboard system.';
export const usage = 'starboard <subcommand> [args]';

export async function execute(message, args) {
  const sub = args[0]?.toLowerCase();
  const db = getDb('starboard');
  const guildId = message.guild.id;

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    await reply(message, `${emojis.error} Only admins can manage starboard.`);
    return;
  }

  if (sub === 'set') {
    const channel = message.mentions.channels.first() || message.channel;
    db.run('INSERT INTO starboard_config (guild_id, channel_id) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET channel_id = ?', [guildId, channel.id, channel.id]);
    await reply(message, `${emojis.success} Starboard channel set to ${channel}.`);
    return;
  }

  if (sub === 'config' || sub === 'show') {
    const config = db.query('SELECT * FROM starboard_config WHERE guild_id = ?').get(guildId);
    if (!config) {
      await reply(message, `${emojis.info} Starboard not configured. Use \`starboard set #channel\`.`);
      return;
    }
    const channel = config.channel_id ? `<#${config.channel_id}>` : 'Not set';
    const ignored = db.query('SELECT channel_id FROM starboard_ignored WHERE guild_id = ?').all(guildId);
    const ignoredList = ignored.length ? ignored.map(i => `<#${i.channel_id}>`).join(', ') : 'None';
    await reply(message,
      `${emojis.starboard} **Starboard Configuration**\n` +
      `Channel: ${channel}\n` +
      `Emoji: ${config.emoji}\n` +
      `Threshold: ${config.threshold}\n` +
      `Color: ${config.color}\n` +
      `Self-star: ${config.self_star ? '✅' : '❌'}\n` +
      `Jump URL: ${config.jump_url ? '✅' : '❌'}\n` +
      `Timestamp: ${config.timestamp ? '✅' : '❌'}\n` +
      `Attachments: ${config.attachments ? '✅' : '❌'}\n` +
      `Locked: ${config.locked ? '✅' : '❌'}\n` +
      `Ignored channels: ${ignoredList}`
    );
    return;
  }

  if (sub === 'emoji') {
    const emoji = args[1];
    if (!emoji) {
      await reply(message, `${emojis.warning} Usage: \`starboard emoji <emoji>\``);
      return;
    }
    db.run('INSERT INTO starboard_config (guild_id, emoji) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET emoji = ?', [guildId, emoji, emoji]);
    await reply(message, `${emojis.success} Starboard emoji set to ${emoji}.`);
    return;
  }

  if (sub === 'threshold') {
    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount < 1) {
      await reply(message, `${emojis.warning} Usage: \`starboard threshold <number>\``);
      return;
    }
    db.run('INSERT INTO starboard_config (guild_id, threshold) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET threshold = ?', [guildId, amount, amount]);
    await reply(message, `${emojis.success} Starboard threshold set to **${amount}**.`);
    return;
  }

  if (sub === 'color') {
    const color = args[1];
    if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) {
      await reply(message, `${emojis.warning} Usage: \`starboard color #hexcolor\``);
      return;
    }
    db.run('INSERT INTO starboard_config (guild_id, color) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET color = ?', [guildId, color, color]);
    await reply(message, `${emojis.success} Starboard color set to ${color}.`);
    return;
  }

  if (sub === 'selfstar') {
    const config = db.query('SELECT self_star FROM starboard_config WHERE guild_id = ?').get(guildId);
    const current = config?.self_star ?? 0;
    const newVal = current ? 0 : 1;
    db.run('INSERT INTO starboard_config (guild_id, self_star) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET self_star = ?', [guildId, newVal, newVal]);
    await reply(message, `${emojis.success} Self-star ${newVal ? 'enabled' : 'disabled'}.`);
    return;
  }

  if (sub === 'jumpurl') {
    const config = db.query('SELECT jump_url FROM starboard_config WHERE guild_id = ?').get(guildId);
    const current = config?.jump_url ?? 1;
    const newVal = current ? 0 : 1;
    db.run('INSERT INTO starboard_config (guild_id, jump_url) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET jump_url = ?', [guildId, newVal, newVal]);
    await reply(message, `${emojis.success} Jump URL ${newVal ? 'enabled' : 'disabled'}.`);
    return;
  }

  if (sub === 'timestamp') {
    const config = db.query('SELECT timestamp FROM starboard_config WHERE guild_id = ?').get(guildId);
    const current = config?.timestamp ?? 1;
    const newVal = current ? 0 : 1;
    db.run('INSERT INTO starboard_config (guild_id, timestamp) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET timestamp = ?', [guildId, newVal, newVal]);
    await reply(message, `${emojis.success} Timestamp ${newVal ? 'enabled' : 'disabled'}.`);
    return;
  }

  if (sub === 'attachments') {
    const config = db.query('SELECT attachments FROM starboard_config WHERE guild_id = ?').get(guildId);
    const current = config?.attachments ?? 1;
    const newVal = current ? 0 : 1;
    db.run('INSERT INTO starboard_config (guild_id, attachments) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET attachments = ?', [guildId, newVal, newVal]);
    await reply(message, `${emojis.success} Attachments ${newVal ? 'enabled' : 'disabled'}.`);
    return;
  }

  if (sub === 'lock') {
    db.run('INSERT INTO starboard_config (guild_id, locked) VALUES (?, 1) ON CONFLICT(guild_id) DO UPDATE SET locked = 1', [guildId]);
    await reply(message, `${emojis.success} Starboard locked. No new entries will be posted.`);
    return;
  }

  if (sub === 'unlock') {
    db.run('INSERT INTO starboard_config (guild_id, locked) VALUES (?, 0) ON CONFLICT(guild_id) DO UPDATE SET locked = 0', [guildId]);
    await reply(message, `${emojis.success} Starboard unlocked.`);
    return;
  }

  if (sub === 'reset') {
    db.run('DELETE FROM starboard_config WHERE guild_id = ?', [guildId]);
    db.run('DELETE FROM starboard_messages WHERE guild_id = ?', [guildId]);
    db.run('DELETE FROM starboard_ignored WHERE guild_id = ?', [guildId]);
    await reply(message, `${emojis.success} Starboard configuration reset.`);
    return;
  }

  if (sub === 'ignore') {
    const channel = message.mentions.channels.first();
    if (!channel) {
      await reply(message, `${emojis.warning} Usage: \`starboard ignore #channel\``);
      return;
    }
    db.run('INSERT OR IGNORE INTO starboard_ignored (guild_id, channel_id) VALUES (?, ?)', [guildId, channel.id]);
    await reply(message, `${emojis.success} ${channel} added to starboard ignore list.`);
    return;
  }

  if (sub === 'unignore') {
    const channel = message.mentions.channels.first();
    if (!channel) {
      await reply(message, `${emojis.warning} Usage: \`starboard unignore #channel\``);
      return;
    }
    db.run('DELETE FROM starboard_ignored WHERE guild_id = ? AND channel_id = ?', [guildId, channel.id]);
    await reply(message, `${emojis.success} ${channel} removed from starboard ignore list.`);
    return;
  }

  await reply(message,
    `${emojis.starboard} **Starboard Commands**\n` +
    `\`starboard set [#channel]\` — Set starboard channel\n` +
    `\`starboard config\` — Show configuration\n` +
    `\`starboard emoji <emoji>\` — Set reaction emoji\n` +
    `\`starboard threshold <n>\` — Set minimum stars\n` +
    `\`starboard color #hex\` — Set embed color\n` +
    `\`starboard selfstar\` — Toggle self-star\n` +
    `\`starboard jumpurl\` — Toggle jump URL\n` +
    `\`starboard timestamp\` — Toggle timestamp\n` +
    `\`starboard attachments\` — Toggle image preview\n` +
    `\`starboard lock/unlock\` — Lock/unlock posting\n` +
    `\`starboard ignore/unignore #channel\` — Manage ignored channels\n` +
    `\`starboard reset\` — Reset all settings`
  );
}
