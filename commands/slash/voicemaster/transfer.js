import { SlashCommandBuilder } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('transfer')
  .setDescription('Transfer ownership of your voice channel')
  .addUserOption(opt =>
    opt.setName('user').setDescription('New owner').setRequired(true));

export async function execute(interaction) {
  const db = getDb('voicemaster');
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply({ content: `${emojis.error} You must be in a voice channel.` });

  const vmChan = db.query('SELECT * FROM vm_channels WHERE channel_id = ?').get(channel.id);
  if (!vmChan) return interaction.reply({ content: `${emojis.error} This is not a temporary voice channel.` });
  if (vmChan.owner_id !== interaction.user.id) return interaction.reply({ content: `${emojis.error} You do not own this channel.` });

  const target = interaction.options.getUser('user', true);
  const member = interaction.guild.members.cache.get(target.id);
  if (!member || member.voice.channelId !== channel.id) {
    return interaction.reply({ content: `${emojis.error} That user is not in your voice channel.` });
  }

  db.run('UPDATE vm_channels SET owner_id = ? WHERE channel_id = ?', [target.id, channel.id]);

  await interaction.reply({ content: `${emojis.success} Ownership transferred to ${target}.` });
}
