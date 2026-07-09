import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('starboard')
  .setDescription('Manage the starboard system')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(sub =>
    sub.setName('set').setDescription('Set starboard channel')
      .addChannelOption(opt => opt.setName('channel').setDescription('Channel').setRequired(false)))
  .addSubcommand(sub =>
    sub.setName('config').setDescription('Show starboard configuration'))
  .addSubcommand(sub =>
    sub.setName('emoji').setDescription('Set the reaction emoji')
      .addStringOption(opt => opt.setName('emoji').setDescription('Emoji to use').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('threshold').setDescription('Set minimum stars required')
      .addIntegerOption(opt => opt.setName('amount').setDescription('Minimum stars').setRequired(true).setMinValue(1)))
  .addSubcommand(sub =>
    sub.setName('color').setDescription('Set embed color')
      .addStringOption(opt => opt.setName('color').setDescription('Hex color (e.g. #FFD700)').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('selfstar').setDescription('Toggle allowing users to star their own messages'))
  .addSubcommand(sub =>
    sub.setName('jumpurl').setDescription('Toggle jump URL in starboard embed'))
  .addSubcommand(sub =>
    sub.setName('timestamp').setDescription('Toggle timestamp in starboard embed'))
  .addSubcommand(sub =>
    sub.setName('attachments').setDescription('Toggle image preview in starboard embed'))
  .addSubcommand(sub =>
    sub.setName('lock').setDescription('Lock starboard (stop new entries)'))
  .addSubcommand(sub =>
    sub.setName('unlock').setDescription('Unlock starboard'))
  .addSubcommand(sub =>
    sub.setName('reset').setDescription('Reset all starboard settings'))
  .addSubcommand(sub =>
    sub.setName('ignore').setDescription('Ignore a channel')
      .addChannelOption(opt => opt.setName('channel').setDescription('Channel to ignore').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('unignore').setDescription('Unignore a channel')
      .addChannelOption(opt => opt.setName('channel').setDescription('Channel to unignore').setRequired(true)));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const db = getDb('starboard');
  const guildId = interaction.guild.id;

  if (sub === 'set') {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    db.run('INSERT INTO starboard_config (guild_id, channel_id) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET channel_id = ?', [guildId, channel.id, channel.id]);
    await interaction.reply(`${emojis.success} Starboard channel set to ${channel}.`);
    return;
  }

  if (sub === 'config') {
    const config = db.query('SELECT * FROM starboard_config WHERE guild_id = ?').get(guildId);
    if (!config) {
      await interaction.reply(`${emojis.info} Starboard not configured. Use \`/starboard set\`.`);
      return;
    }
    const ignored = db.query('SELECT channel_id FROM starboard_ignored WHERE guild_id = ?').all(guildId);
    const ignoredList = ignored.length ? ignored.map(i => `<#${i.channel_id}>`).join(', ') : 'None';
    await interaction.reply(
      `${emojis.starboard} **Starboard Configuration**\n` +
      `Channel: ${config.channel_id ? `<#${config.channel_id}>` : 'Not set'}\n` +
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
    const emoji = interaction.options.getString('emoji', true);
    db.run('INSERT INTO starboard_config (guild_id, emoji) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET emoji = ?', [guildId, emoji, emoji]);
    await interaction.reply(`${emojis.success} Starboard emoji set to ${emoji}.`);
    return;
  }

  if (sub === 'threshold') {
    const amount = interaction.options.getInteger('amount', true);
    db.run('INSERT INTO starboard_config (guild_id, threshold) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET threshold = ?', [guildId, amount, amount]);
    await interaction.reply(`${emojis.success} Starboard threshold set to **${amount}**.`);
    return;
  }

  if (sub === 'color') {
    const color = interaction.options.getString('color', true);
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      await interaction.reply({ content: `${emojis.warning} Use a valid hex color (e.g. #FFD700).`, flags: MessageFlags.Ephemeral });
      return;
    }
    db.run('INSERT INTO starboard_config (guild_id, color) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET color = ?', [guildId, color, color]);
    await interaction.reply(`${emojis.success} Starboard color set to ${color}.`);
    return;
  }

  if (sub === 'selfstar') {
    const config = db.query('SELECT self_star FROM starboard_config WHERE guild_id = ?').get(guildId);
    const newVal = config?.self_star ? 0 : 1;
    db.run('INSERT INTO starboard_config (guild_id, self_star) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET self_star = ?', [guildId, newVal, newVal]);
    await interaction.reply(`${emojis.success} Self-star ${newVal ? 'enabled' : 'disabled'}.`);
    return;
  }

  if (sub === 'jumpurl') {
    const config = db.query('SELECT jump_url FROM starboard_config WHERE guild_id = ?').get(guildId);
    const newVal = config?.jump_url ? 0 : 1;
    db.run('INSERT INTO starboard_config (guild_id, jump_url) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET jump_url = ?', [guildId, newVal, newVal]);
    await interaction.reply(`${emojis.success} Jump URL ${newVal ? 'enabled' : 'disabled'}.`);
    return;
  }

  if (sub === 'timestamp') {
    const config = db.query('SELECT timestamp FROM starboard_config WHERE guild_id = ?').get(guildId);
    const newVal = config?.timestamp ? 0 : 1;
    db.run('INSERT INTO starboard_config (guild_id, timestamp) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET timestamp = ?', [guildId, newVal, newVal]);
    await interaction.reply(`${emojis.success} Timestamp ${newVal ? 'enabled' : 'disabled'}.`);
    return;
  }

  if (sub === 'attachments') {
    const config = db.query('SELECT attachments FROM starboard_config WHERE guild_id = ?').get(guildId);
    const newVal = config?.attachments ? 0 : 1;
    db.run('INSERT INTO starboard_config (guild_id, attachments) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET attachments = ?', [guildId, newVal, newVal]);
    await interaction.reply(`${emojis.success} Attachments ${newVal ? 'enabled' : 'disabled'}.`);
    return;
  }

  if (sub === 'lock') {
    db.run('INSERT INTO starboard_config (guild_id, locked) VALUES (?, 1) ON CONFLICT(guild_id) DO UPDATE SET locked = 1', [guildId]);
    await interaction.reply(`${emojis.success} Starboard locked.`);
    return;
  }

  if (sub === 'unlock') {
    db.run('INSERT INTO starboard_config (guild_id, locked) VALUES (?, 0) ON CONFLICT(guild_id) DO UPDATE SET locked = 0', [guildId]);
    await interaction.reply(`${emojis.success} Starboard unlocked.`);
    return;
  }

  if (sub === 'reset') {
    db.run('DELETE FROM starboard_config WHERE guild_id = ?', [guildId]);
    db.run('DELETE FROM starboard_messages WHERE guild_id = ?', [guildId]);
    db.run('DELETE FROM starboard_ignored WHERE guild_id = ?', [guildId]);
    await interaction.reply(`${emojis.success} Starboard configuration reset.`);
    return;
  }

  if (sub === 'ignore') {
    const channel = interaction.options.getChannel('channel', true);
    db.run('INSERT OR IGNORE INTO starboard_ignored (guild_id, channel_id) VALUES (?, ?)', [guildId, channel.id]);
    await interaction.reply(`${emojis.success} ${channel} added to starboard ignore list.`);
    return;
  }

  if (sub === 'unignore') {
    const channel = interaction.options.getChannel('channel', true);
    db.run('DELETE FROM starboard_ignored WHERE guild_id = ? AND channel_id = ?', [guildId, channel.id]);
    await interaction.reply(`${emojis.success} ${channel} removed from starboard ignore list.`);
    return;
  }
}
