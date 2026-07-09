import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('enlarge')
  .setDescription('Show a larger version of an emoji')
  .addStringOption(opt => opt.setName('emoji').setDescription('Emoji to enlarge').setRequired(true));

export async function execute(interaction) {
  const emoji = interaction.options.getString('emoji', true);
  const match = emoji.match(/<?a?:?(\w+):(\d+)>/);

  if (!match) {
    await interaction.reply({ content: `${emojis.warning} Usage: \`enlarge :emoji:\``, flags: MessageFlags.Ephemeral });
    return;
  }

  const animated = emoji.startsWith('<a:');
  const id = match[2];
  const ext = animated ? 'gif' : 'png';
  const url = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=4096&quality=lossless`;

  await interaction.reply({ content: `${emojis.info} **${match[1]}**`, files: [url] });
}
