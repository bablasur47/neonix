import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Manage admin roles')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(sub =>
    sub.setName('add').setDescription('Add an admin role')
      .addRoleOption(opt => opt.setName('role').setDescription('Role to add as admin').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('remove').setDescription('Remove an admin role')
      .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('show').setDescription('Show all admin roles'))
  .addSubcommand(sub =>
    sub.setName('reset').setDescription('Reset all admin roles'));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const db = getDb('moderation');
  const guildId = interaction.guild.id;

  if (sub === 'add') {
    const role = interaction.options.getRole('role', true);
    db.run('INSERT OR IGNORE INTO guild_roles (guild_id, type, role_id) VALUES (?, ?, ?)', [guildId, 'admin', role.id]);
    await interaction.reply(`${emojis.success} **${role.name}** added as admin role.`);
    return;
  }

  if (sub === 'remove') {
    const role = interaction.options.getRole('role', true);
    db.run('DELETE FROM guild_roles WHERE guild_id = ? AND type = ? AND role_id = ?', [guildId, 'admin', role.id]);
    await interaction.reply(`${emojis.success} **${role.name}** removed from admin roles.`);
    return;
  }

  if (sub === 'show') {
    const rows = db.query('SELECT role_id FROM guild_roles WHERE guild_id = ? AND type = ?').all(guildId, 'admin');
    const roles = rows.map(r => `<@&${r.role_id}>`).join(', ') || 'None set';
    await interaction.reply(`${emojis.info} **Admin Roles:**\n${roles}`);
    return;
  }

  if (sub === 'reset') {
    db.run('DELETE FROM guild_roles WHERE guild_id = ? AND type = ?', [guildId, 'admin']);
    await interaction.reply(`${emojis.success} All admin roles reset.`);
    return;
  }
}
