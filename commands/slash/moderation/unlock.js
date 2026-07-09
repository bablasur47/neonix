import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('unlock')
  .setDescription('Unlock a channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption(opt => opt.setName('channel').setDescription('Channel to unlock').setRequired(false));

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel') || interaction.channel;

  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: null });
    await interaction.reply(`${emojis.success} Unlocked ${channel}`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to unlock: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
