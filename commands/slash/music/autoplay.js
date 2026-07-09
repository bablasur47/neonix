import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('autoplay')
  .setDescription('Toggle autoplay for recommended songs when the queue ends');

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

  if (player.isAutoplay) {
    player.isAutoplay = false;
    await interaction.reply(`${emojis.stop} Autoplay disabled.`);
  } else {
    player.isAutoplay = true;
    await interaction.reply(`${emojis.play} Autoplay enabled. Related songs will play automatically when the queue ends.`);
  }
}
