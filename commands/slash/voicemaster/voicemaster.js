import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('voicemaster')
  .setDescription('Manage the VoiceMaster system')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(sub =>
    sub.setName('setup').setDescription('Set up the VoiceMaster system for the server')
      .addChannelOption(opt => opt.setName('channel').setDescription('The join-to-create voice channel').setRequired(true))
      .addChannelOption(opt => opt.setName('category').setDescription('The category to create voice channels in').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('delete').setDescription('Remove the VoiceMaster configuration'));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const db = getDb('voicemaster');
  const guildId = interaction.guild.id;

  if (sub === 'setup') {
    const channel = interaction.options.getChannel('channel', true);
    const category = interaction.options.getChannel('category', true);

    if (channel.type !== ChannelType.GuildVoice) {
      return interaction.reply({ content: `${emojis.error} The channel must be a voice channel.` });
    }
    if (category.type !== ChannelType.GuildCategory) {
      return interaction.reply({ content: `${emojis.error} The category must be a category.` });
    }

    db.run('INSERT OR REPLACE INTO vm_config (guild_id, channel_id, category_id) VALUES (?, ?, ?)',
      [guildId, channel.id, category.id]);

    await interaction.reply({
      content: `${emojis.success} VoiceMaster configured!\n**Join Channel:** <#${channel.id}>\n**Category:** ${category.name}`,
    });
    return;
  }

  if (sub === 'delete') {
    const config = db.query('SELECT * FROM vm_config WHERE guild_id = ?').get(guildId);
    if (!config) {
      return interaction.reply({ content: `${emojis.error} VoiceMaster is not configured for this server.` });
    }

    db.run('DELETE FROM vm_config WHERE guild_id = ?', [guildId]);
    db.run('DELETE FROM vm_channels WHERE guild_id = ?', [guildId]);

    await interaction.reply({ content: `${emojis.success} VoiceMaster configuration removed.` });
  }
}
