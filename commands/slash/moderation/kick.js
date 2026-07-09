import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a user from the server')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption(opt => opt.setName('user').setDescription('User to kick').setRequired(true))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason for the kick').setRequired(false));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  if (!member) {
    await interaction.reply({ content: `${emojis.error} User not found in this server.`, flags: MessageFlags.Ephemeral });
    return;
  }

  if (member.id === interaction.user.id) {
    await interaction.reply({ content: `${emojis.error} You cannot kick yourself.`, flags: MessageFlags.Ephemeral });
    return;
  }

  try {
    await member.kick(`${interaction.user.tag}: ${reason}`);
    await interaction.reply(`${emojis.success} Kicked **${member.user.tag}** | ${reason}`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to kick: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
