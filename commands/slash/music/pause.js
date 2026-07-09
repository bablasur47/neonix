import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Pause the current track');

export async function execute(interaction) {
  const riffy = interaction.client.riffy;
  if (!riffy) {
    await interaction.reply({ content: `${emojis.error} Music system is not connected.`, flags: MessageFlags.Ephemeral });
    return;
  }
  const player = riffy.players.get(interaction.guild.id);
  if (!player) {
    await interaction.reply({ content: `${emojis.error} No music is playing.`, flags: MessageFlags.Ephemeral });
    return;
  }

  if (player.paused) {
    await interaction.reply({ content: `${emojis.warning} Music is already paused. Use \`/resume\`.`, flags: MessageFlags.Ephemeral });
    return;
  }

  player.pause(true);
  await interaction.reply(`${emojis.pause} Paused.`);
}
