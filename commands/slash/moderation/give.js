import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('give')
  .setDescription('Give a role to a user')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption(opt => opt.setName('user').setDescription('User to give role to').setRequired(true))
  .addRoleOption(opt => opt.setName('role').setDescription('Role to give').setRequired(true));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const role = interaction.options.getRole('role', true);

  if (!member) {
    await interaction.reply({ content: `${emojis.error} User not found.`, flags: MessageFlags.Ephemeral });
    return;
  }

  try {
    await member.roles.add(role);
    await interaction.reply(`${emojis.success} Gave **${role.name}** to **${member.user.tag}**`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
