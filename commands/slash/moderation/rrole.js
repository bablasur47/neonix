import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('rrole')
  .setDescription('Remove a role from a user')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption(opt => opt.setName('user').setDescription('User to remove role from').setRequired(true))
  .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const role = interaction.options.getRole('role', true);

  if (!member) {
    await interaction.reply({ content: `${emojis.error} User not found.`, flags: MessageFlags.Ephemeral });
    return;
  }

  try {
    await member.roles.remove(role);
    await interaction.reply(`${emojis.success} Removed **${role.name}** from **${member.user.tag}**`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
