import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('delsticker')
  .setDescription('Delete a sticker from the server')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
  .addStringOption(opt => opt.setName('sticker_id').setDescription('ID of the sticker to delete').setRequired(true));

export async function execute(interaction) {
  const stickerId = interaction.options.getString('sticker_id', true);

  try {
    await interaction.guild.stickers.delete(stickerId, `Deleted by ${interaction.user.tag}`);
    await interaction.reply(`${emojis.success} Sticker deleted.`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to delete: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
