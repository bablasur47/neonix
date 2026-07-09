import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a user from the server')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason for the ban').setRequired(false))
  .addIntegerOption(opt => opt.setName('days').setDescription('Days of messages to delete (0-7)').setRequired(false).setMinValue(0).setMaxValue(7));

export async function execute(interaction) {
  const target = interaction.options.getUser('user', true);
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const days = interaction.options.getInteger('days') || 0;

  if (!target.bot && target.id === interaction.user.id) {
    await interaction.reply({ content: `${emojis.error} You cannot ban yourself.`, flags: MessageFlags.Ephemeral });
    return;
  }

  try {
    await interaction.guild.members.ban(target.id, { days, reason: `${interaction.user.tag}: ${reason}` });
    await interaction.reply(`${emojis.success} Banned **${target.tag}** | ${reason}`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to ban ${target.tag}: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
