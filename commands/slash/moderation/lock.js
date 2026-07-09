import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('lock')
  .setDescription('Lock a channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption(opt => opt.setName('channel').setDescription('Channel to lock').setRequired(false))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false));

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel') || interaction.channel;
  const reason = interaction.options.getString('reason') || 'Locked by moderator';

  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: false }, { reason });
    await interaction.reply(`${emojis.success} Locked ${channel} | ${reason}`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to lock: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
