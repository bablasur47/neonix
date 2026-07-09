import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('unlock')
  .setDescription('Unlock your temporary voice channel');

export async function execute(interaction) {
  const db = getDb('voicemaster');
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply({ content: `${emojis.error} You must be in a voice channel.` });

  const vmChan = db.query('SELECT * FROM vm_channels WHERE channel_id = ?').get(channel.id);
  if (!vmChan) return interaction.reply({ content: `${emojis.error} This is not a temporary voice channel.` });
  if (vmChan.owner_id !== interaction.user.id) return interaction.reply({ content: `${emojis.error} You do not own this channel.` });

  await channel.permissionOverwrites.edit(interaction.guild.id, { Connect: null });

  await interaction.reply({ content: `${emojis.success} Channel unlocked! Anyone can join.` });
}
