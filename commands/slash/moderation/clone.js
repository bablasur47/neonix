import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('clone')
  .setDescription('Clone a channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption(opt => opt.setName('channel').setDescription('Channel to clone').setRequired(false))
  .addStringOption(opt => opt.setName('name').setDescription('Name for the cloned channel').setRequired(false));

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel') || interaction.channel;
  const name = interaction.options.getString('name') || `${channel.name}-copy`;

  try {
    await channel.clone({ name, reason: `Cloned by ${interaction.user.tag}` });
    await interaction.reply(`${emojis.success} Cloned ${channel} as **${name}**`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to clone: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
