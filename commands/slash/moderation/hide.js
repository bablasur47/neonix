import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('hide')
  .setDescription('Hide a channel from @everyone')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption(opt => opt.setName('channel').setDescription('Channel to hide').setRequired(false));

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel') || interaction.channel;

  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { ViewChannel: false });
    await interaction.reply(`${emojis.success} Hidden ${channel}`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to hide: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
