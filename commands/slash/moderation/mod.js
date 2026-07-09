import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('mod')
  .setDescription('Manage moderator roles')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(sub =>
    sub.setName('add').setDescription('Add a moderator role')
      .addRoleOption(opt => opt.setName('role').setDescription('Role to add as mod').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('remove').setDescription('Remove a moderator role')
      .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('show').setDescription('Show all moderator roles'))
  .addSubcommand(sub =>
    sub.setName('reset').setDescription('Reset all moderator roles'))
  .addSubcommand(sub =>
    sub.setName('setup').setDescription('Create and assign a moderator role')
      .addStringOption(opt => opt.setName('name').setDescription('Role name').setRequired(false)));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const db = getDb('moderation');
  const guildId = interaction.guild.id;

  if (sub === 'add') {
    const role = interaction.options.getRole('role', true);
    db.run('INSERT OR IGNORE INTO guild_roles (guild_id, type, role_id) VALUES (?, ?, ?)', [guildId, 'mod', role.id]);
    await interaction.reply(`${emojis.success} **${role.name}** added as mod role.`);
    return;
  }

  if (sub === 'remove') {
    const role = interaction.options.getRole('role', true);
    db.run('DELETE FROM guild_roles WHERE guild_id = ? AND type = ? AND role_id = ?', [guildId, 'mod', role.id]);
    await interaction.reply(`${emojis.success} **${role.name}** removed from mod roles.`);
    return;
  }

  if (sub === 'show') {
    const rows = db.query('SELECT role_id FROM guild_roles WHERE guild_id = ? AND type = ?').all(guildId, 'mod');
    const roles = rows.map(r => `<@&${r.role_id}>`).join(', ') || 'None set';
    await interaction.reply(`${emojis.info} **Mod Roles:**\n${roles}`);
    return;
  }

  if (sub === 'reset') {
    db.run('DELETE FROM guild_roles WHERE guild_id = ? AND type = ?', [guildId, 'mod']);
    await interaction.reply(`${emojis.success} All mod roles reset.`);
    return;
  }

  if (sub === 'setup') {
    const name = interaction.options.getString('name') || 'Moderator';
    let role = interaction.guild.roles.cache.find(r => r.name === name);
    if (!role) {
      role = await interaction.guild.roles.create({ name, reason: 'Mod setup' });
    }
    db.run('INSERT OR IGNORE INTO guild_roles (guild_id, type, role_id) VALUES (?, ?, ?)', [guildId, 'mod', role.id]);
    await interaction.reply(`${emojis.success} Mod role **${role.name}** created and assigned.`);
    return;
  }
}
