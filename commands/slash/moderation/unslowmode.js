import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('unslowmode')
  .setDescription('Remove slowmode from a channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption(opt => opt.setName('channel').setDescription('Channel to remove slowmode').setRequired(false));

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel') || interaction.channel;

  try {
    await channel.setRateLimitPerUser(0);
    await interaction.reply(`${emojis.success} Slowmode removed from ${channel}`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to remove slowmode: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
