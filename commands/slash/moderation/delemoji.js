import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('delemoji')
  .setDescription('Delete an emoji from the server')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
  .addStringOption(opt => opt.setName('emoji').setDescription('Emoji to delete').setRequired(true));

export async function execute(interaction) {
  const input = interaction.options.getString('emoji', true);
  const match = input.match(/<?a?:?\w+:(\d+)>/);
  const emojiId = match?.[1] || input;
  const emoji = interaction.guild.emojis.cache.get(emojiId);

  if (!emoji) {
    await interaction.reply({ content: `${emojis.warning} Emoji not found.`, flags: MessageFlags.Ephemeral });
    return;
  }

  try {
    await emoji.delete(`Deleted by ${interaction.user.tag}`);
    await interaction.reply(`${emojis.success} Deleted **${emoji.name}**`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to delete: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
