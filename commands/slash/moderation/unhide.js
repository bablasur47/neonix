import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('unhide')
  .setDescription('Unhide a channel from @everyone')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption(opt => opt.setName('channel').setDescription('Channel to unhide').setRequired(false));

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel') || interaction.channel;

  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { ViewChannel: null });
    await interaction.reply(`${emojis.success} Unhidden ${channel}`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to unhide: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
