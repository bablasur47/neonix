import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Timeout/mute a user')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(opt => opt.setName('user').setDescription('User to mute').setRequired(true))
  .addStringOption(opt => opt.setName('duration').setDescription('Duration (e.g. 10m, 1h, 7d)').setRequired(false))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason for the mute').setRequired(false));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const durStr = interaction.options.getString('duration') || '1h';

  if (!member) {
    await interaction.reply({ content: `${emojis.error} User not found in this server.`, flags: MessageFlags.Ephemeral });
    return;
  }

  if (member.id === interaction.user.id) {
    await interaction.reply({ content: `${emojis.error} You cannot mute yourself.`, flags: MessageFlags.Ephemeral });
    return;
  }

  const match = durStr.match(/^(\d+)(s|m|h|d)$/);
  let duration;
  if (match) {
    const num = parseInt(match[1]);
    const unit = match[2];
    duration = num * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit] || 60000);
  } else {
    duration = parseInt(durStr) * 60000 || 3600000;
  }

  try {
    await member.timeout(duration, `${interaction.user.tag}: ${reason}`);
    const mins = Math.round(duration / 60000);
    await interaction.reply(`${emojis.success} Muted **${member.user.tag}** for ${mins}min | ${reason}`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to mute: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
