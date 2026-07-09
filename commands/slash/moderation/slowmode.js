import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('slowmode')
  .setDescription('Set slowmode in a channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addIntegerOption(opt => opt.setName('seconds').setDescription('Slowmode in seconds (0-21600)').setRequired(true).setMinValue(0).setMaxValue(21600))
  .addChannelOption(opt => opt.setName('channel').setDescription('Channel to set slowmode').setRequired(false));

export async function execute(interaction) {
  const seconds = interaction.options.getInteger('seconds', true);
  const channel = interaction.options.getChannel('channel') || interaction.channel;

  try {
    await channel.setRateLimitPerUser(seconds);
    if (seconds > 0) {
      await interaction.reply(`${emojis.success} Slowmode set to ${seconds}s in ${channel}`);
    } else {
      await interaction.reply(`${emojis.success} Slowmode removed in ${channel}`);
    }
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to set slowmode: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
