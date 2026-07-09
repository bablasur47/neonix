import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';
import config from '../../../util/config.js';

export const data = new SlashCommandBuilder()
  .setName('prefix')
  .setDescription('Change or view the bot prefix for this server')
  .addStringOption(opt =>
    opt.setName('prefix').setDescription('New prefix (max 5 characters)').setRequired(false).setMaxLength(5)
  );

export async function execute(interaction) {
  const newPrefix = interaction.options.getString('prefix');
  const db = getDb('guilds');
  const guildId = interaction.guild.id;

  if (!newPrefix) {
    const row = db.query('SELECT prefix FROM guild_config WHERE guild_id = ?').get(guildId);
    const current = row?.prefix || config.initialPrefix;
    await interaction.reply(`${emojis.info} Current prefix for this server: \`${current}\``);
    return;
  }

  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) &&
      !interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    await interaction.reply({ content: `${emojis.error} Only administrators or members with Ban Members permission can change the prefix.`, flags: MessageFlags.Ephemeral });
    return;
  }

  if (newPrefix.length > 5) {
    await interaction.reply({ content: `${emojis.warning} Prefix must be 5 characters or less.`, flags: MessageFlags.Ephemeral });
    return;
  }

  if (newPrefix.includes(' ')) {
    await interaction.reply({ content: `${emojis.warning} Prefix cannot contain spaces.`, flags: MessageFlags.Ephemeral });
    return;
  }

  try {
    db.run('INSERT INTO guild_config (guild_id, prefix) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET prefix = ?',
      [guildId, newPrefix, newPrefix]);
    await interaction.reply(`${emojis.success} Prefix changed to \`${newPrefix}\``);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to change prefix: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
