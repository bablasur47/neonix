import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription('Remove a timeout from a user')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(opt => opt.setName('user').setDescription('User to unmute').setRequired(true));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');

  if (!member) {
    await interaction.reply({ content: `${emojis.error} User not found in this server.`, flags: MessageFlags.Ephemeral });
    return;
  }

  try {
    await member.timeout(null);
    await interaction.reply(`${emojis.success} Unmuted **${member.user.tag}**`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to unmute: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
