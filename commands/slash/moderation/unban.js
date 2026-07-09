import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unban a user by ID')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addStringOption(opt => opt.setName('user_id').setDescription('ID of the user to unban').setRequired(true));

export async function execute(interaction) {
  const id = interaction.options.getString('user_id', true);

  try {
    await interaction.guild.members.unban(id);
    await interaction.reply(`${emojis.success} Unbanned \`${id}\``);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to unban: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
