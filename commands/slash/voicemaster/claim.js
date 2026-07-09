import { SlashCommandBuilder } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('claim')
  .setDescription('Claim an ownerless voice channel');

export async function execute(interaction) {
  const db = getDb('voicemaster');
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply({ content: `${emojis.error} You must be in a voice channel.` });

  const vmChan = db.query('SELECT * FROM vm_channels WHERE channel_id = ?').get(channel.id);
  if (!vmChan) return interaction.reply({ content: `${emojis.error} This is not a temporary voice channel.` });

  const owner = interaction.guild.members.cache.get(vmChan.owner_id);
  if (owner && owner.voice.channelId === channel.id) {
    return interaction.reply({ content: `${emojis.error} This channel already has an owner.` });
  }

  db.run('UPDATE vm_channels SET owner_id = ? WHERE channel_id = ?', [interaction.user.id, channel.id]);

  await interaction.reply({ content: `${emojis.success} You are now the owner of this channel.` });
}
