import { SlashCommandBuilder } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('info')
  .setDescription('View info about your current voice channel');

export async function execute(interaction) {
  const db = getDb('voicemaster');
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply({ content: `${emojis.error} You must be in a voice channel.` });

  const vmChan = db.query('SELECT * FROM vm_channels WHERE channel_id = ?').get(channel.id);
  if (!vmChan) return interaction.reply({ content: `${emojis.error} This is not a temporary voice channel.` });

  const owner = await interaction.client.users.fetch(vmChan.owner_id).catch(() => null);
  const userLimit = channel.userLimit || 'Unlimited';
  const bitrate = channel.bitrate / 1000;
  const members = channel.members.size;
  const locked = channel.permissionOverwrites.cache.get(interaction.guild.id)
    ?.deny.has('Connect') ?? false;

  await interaction.reply({
    content:
      `${emojis.info} **Channel Info**\n` +
      `**Name:** ${channel.name}\n` +
      `**Owner:** ${owner ? owner.tag : 'Unknown'}\n` +
      `**Members:** ${members}\n` +
      `**User Limit:** ${userLimit}\n` +
      `**Bitrate:** ${bitrate} kbps\n` +
      `**Locked:** ${locked ? 'Yes' : 'No'}`,
  });
}
