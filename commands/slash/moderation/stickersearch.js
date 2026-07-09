import { SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('stickersearch')
  .setDescription('Search for stickers by name')
  .addStringOption(opt => opt.setName('name').setDescription('Sticker name to search').setRequired(true));

export async function execute(interaction) {
  const query = interaction.options.getString('name', true).toLowerCase();
  const stickers = await interaction.guild.stickers.fetch().catch(() => null);

  if (!stickers?.size) {
    await interaction.reply(`${emojis.info} No stickers in this server.`);
    return;
  }

  const found = stickers.filter(s => s.name.toLowerCase().includes(query));
  if (!found.size) {
    await interaction.reply(`${emojis.info} No stickers found matching **${query}**`);
    return;
  }

  const formatted = found.map(s => `• **${s.name}** — \`${s.id}\``).join('\n');
  await interaction.reply(`${emojis.info} **Found ${found.size} sticker(s):**\n${formatted}`);
}
