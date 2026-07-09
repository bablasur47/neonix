import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('snipe')
  .setDescription('Show the last deleted message');

export async function execute(interaction) {
  const snipe = interaction.client.snipeCache?.get(interaction.channel.id);
  if (!snipe) {
    await interaction.reply({ content: `${emojis.info} Nothing to snipe in this channel.`, flags: MessageFlags.Ephemeral });
    return;
  }

  const time = Math.floor((Date.now() - snipe.timestamp) / 1000);
  await interaction.reply(
    `${emojis.info} **${snipe.author}** — <t:${time}:R>\n${snipe.content || '[no text content]'}`
  );
}
