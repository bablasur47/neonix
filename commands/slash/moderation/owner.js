import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('owner')
  .setDescription('Manage owner-level roles')
  .addSubcommand(sub =>
    sub.setName('add').setDescription('Add an owner-level role')
      .addRoleOption(opt => opt.setName('role').setDescription('Role to add').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('remove').setDescription('Remove an owner-level role')
      .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('show').setDescription('Show all owner-level roles'))
  .addSubcommand(sub =>
    sub.setName('reset').setDescription('Reset all owner-level roles'));

export async function execute(interaction) {
  if (interaction.user.id !== interaction.guild.ownerId) {
    await interaction.reply({ content: `${emojis.error} Only the server owner can use this command.`, flags: MessageFlags.Ephemeral });
    return;
  }

  const sub = interaction.options.getSubcommand();
  const db = getDb('moderation');
  const guildId = interaction.guild.id;

  if (sub === 'add') {
    const role = interaction.options.getRole('role', true);
    db.run('INSERT OR IGNORE INTO guild_roles (guild_id, type, role_id) VALUES (?, ?, ?)', [guildId, 'owner', role.id]);
    await interaction.reply(`${emojis.success} **${role.name}** added as owner-level role.`);
    return;
  }

  if (sub === 'remove') {
    const role = interaction.options.getRole('role', true);
    db.run('DELETE FROM guild_roles WHERE guild_id = ? AND type = ? AND role_id = ?', [guildId, 'owner', role.id]);
    await interaction.reply(`${emojis.success} **${role.name}** removed from owner-level roles.`);
    return;
  }

  if (sub === 'show') {
    const rows = db.query('SELECT role_id FROM guild_roles WHERE guild_id = ? AND type = ?').all(guildId, 'owner');
    const roles = rows.map(r => `<@&${r.role_id}>`).join(', ') || 'None set';
    await interaction.reply(`${emojis.info} **Owner-level Roles:**\n${roles}`);
    return;
  }

  if (sub === 'reset') {
    db.run('DELETE FROM guild_roles WHERE guild_id = ? AND type = ?', [guildId, 'owner']);
    await interaction.reply(`${emojis.success} All owner-level roles reset.`);
    return;
  }
}
