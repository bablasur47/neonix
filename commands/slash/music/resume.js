import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('resume')
  .setDescription('Resume the current track');

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

  if (!player.paused) {
    await interaction.reply({ content: `${emojis.warning} Music is not paused.`, flags: MessageFlags.Ephemeral });
    return;
  }

  player.pause(false);
  await interaction.reply(`${emojis.play} Resumed.`);
}
