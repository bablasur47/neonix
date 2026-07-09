import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('roleicon')
  .setDescription('Set a role icon')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addRoleOption(opt => opt.setName('role').setDescription('Role to set icon').setRequired(true))
  .addStringOption(opt => opt.setName('emoji').setDescription('Emoji to use as icon').setRequired(true));

export async function execute(interaction) {
  const role = interaction.options.getRole('role', true);
  const unicode = interaction.options.getString('emoji', true);

  try {
    await role.setIcon(unicode);
    await interaction.reply(`${emojis.success} Role icon set to ${unicode} for **${role.name}**`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
