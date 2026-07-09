import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Stop the music and clear the queue');

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

  player.queue.clear();
  player.stop();
  player.destroy();

  await interaction.reply(`${emojis.stop} Stopped the music and cleared the queue.`);
}
