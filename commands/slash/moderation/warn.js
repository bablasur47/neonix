import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn a user')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addSubcommand(sub =>
    sub.setName('add').setDescription('Add a warning to a user')
      .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason for the warning').setRequired(false)))
  .addSubcommand(sub =>
    sub.setName('remove').setDescription('Remove a warning by ID')
      .addIntegerOption(opt => opt.setName('id').setDescription('Warning ID').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('clear').setDescription('Clear all warnings for a user')
      .addUserOption(opt => opt.setName('user').setDescription('User to clear warnings').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('list').setDescription('Show warnings for a user')
      .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(false)));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const db = getDb('moderation');
  const guildId = interaction.guild.id;

  if (sub === 'add') {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason';
    if (!target) {
      await interaction.reply({ content: `${emojis.error} User not found.`, flags: MessageFlags.Ephemeral });
      return;
    }
    db.run('INSERT INTO warns (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)',
      [guildId, target.id, interaction.user.id, reason]);
    const count = db.query('SELECT COUNT(*) as c FROM warns WHERE guild_id = ? AND user_id = ?').get(guildId, target.id).c;
    await interaction.reply(`${emojis.warning} Warned **${target.user.tag}** | ${reason} (Warning #${count})`);
    return;
  }

  if (sub === 'remove') {
    const id = interaction.options.getInteger('id', true);
    const result = db.run('DELETE FROM warns WHERE id = ? AND guild_id = ?', [id, guildId]);
    if (result.changes) {
      await interaction.reply(`${emojis.success} Warning #${id} removed.`);
    } else {
      await interaction.reply({ content: `${emojis.error} Warning #${id} not found.`, flags: MessageFlags.Ephemeral });
    }
    return;
  }

  if (sub === 'clear') {
    const target = interaction.options.getUser('user', true);
    const result = db.run('DELETE FROM warns WHERE guild_id = ? AND user_id = ?', [guildId, target.id]);
    await interaction.reply(`${emojis.success} Cleared ${result.changes} warnings for **${target.tag}**`);
    return;
  }

  if (sub === 'list') {
    const target = interaction.options.getMember('user') || interaction.member;
    const warns = db.query(
      'SELECT id, reason, moderator_id, created_at FROM warns WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC'
    ).all(guildId, target.id);
    if (!warns.length) {
      await interaction.reply(`${emojis.info} **${target.user.tag}** has no warnings.`);
      return;
    }
    const lines = warns.map(w =>
      `#${w.id} | ${w.reason} — <t:${Math.floor(new Date(w.created_at + 'Z').getTime() / 1000)}:R>`
    );
    await interaction.reply([`${emojis.info} **${target.user.tag}** — ${warns.length} warning(s):`, '---', ...lines].join('\n'));
    return;
  }
}
