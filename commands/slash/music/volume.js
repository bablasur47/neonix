import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('volume')
  .setDescription('Set the playback volume (0-100)')
  .addIntegerOption(opt =>
    opt.setName('level').setDescription('Volume level (0-100)').setRequired(true).setMinValue(0).setMaxValue(100)
  );

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

  const vol = interaction.options.getInteger('level', true);
  player.setVolume(vol);
  await interaction.reply(`${emojis.volume} Volume set to **${vol}%**.`);
}
