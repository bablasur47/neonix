import { SlashCommandBuilder } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('permit')
  .setDescription('Allow a specific user into your locked channel')
  .addUserOption(opt =>
    opt.setName('user').setDescription('User to permit').setRequired(true));

export async function execute(interaction) {
  const db = getDb('voicemaster');
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply({ content: `${emojis.error} You must be in a voice channel.` });

  const vmChan = db.query('SELECT * FROM vm_channels WHERE channel_id = ?').get(channel.id);
  if (!vmChan) return interaction.reply({ content: `${emojis.error} This is not a temporary voice channel.` });
  if (vmChan.owner_id !== interaction.user.id) return interaction.reply({ content: `${emojis.error} You do not own this channel.` });

  const target = interaction.options.getUser('user', true);
  await channel.permissionOverwrites.edit(target.id, { Connect: true });

  await interaction.reply({ content: `${emojis.success} ${target} can now join your channel.` });
}
