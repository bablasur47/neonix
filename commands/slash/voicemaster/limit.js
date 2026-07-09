import { SlashCommandBuilder } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('limit')
  .setDescription('Set a user limit for your voice channel')
  .addIntegerOption(opt =>
    opt.setName('number').setDescription('Max users (0 for unlimited)').setRequired(true).setMinValue(0).setMaxValue(99));

export async function execute(interaction) {
  const db = getDb('voicemaster');
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply({ content: `${emojis.error} You must be in a voice channel.` });

  const vmChan = db.query('SELECT * FROM vm_channels WHERE channel_id = ?').get(channel.id);
  if (!vmChan) return interaction.reply({ content: `${emojis.error} This is not a temporary voice channel.` });
  if (vmChan.owner_id !== interaction.user.id) return interaction.reply({ content: `${emojis.error} You do not own this channel.` });

  const limit = interaction.options.getInteger('number', true);
  await channel.setUserLimit(limit);

  await interaction.reply({ content: `${emojis.success} User limit set to ${limit === 0 ? 'unlimited' : limit}.` });
}
