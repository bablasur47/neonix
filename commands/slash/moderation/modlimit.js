import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('modlimit')
  .setDescription('Set limits for moderator actions')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(sub =>
    sub.setName('set').setDescription('Set the moderation limit')
      .addIntegerOption(opt => opt.setName('number').setDescription('Limit number').setRequired(true).setMinValue(1))
      .addStringOption(opt => opt.setName('type').setDescription('Who to set the limit for').setRequired(false)
        .addChoices({ name: 'admin', value: 'admin' }, { name: 'mod', value: 'mod' }, { name: 'all', value: 'all' })))
  .addSubcommand(sub =>
    sub.setName('show').setDescription('Show current limits'))
  .addSubcommand(sub =>
    sub.setName('reset').setDescription('Reset all limits to default'));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const db = getDb('guilds');
  const guildId = interaction.guild.id;

  if (sub === 'set') {
    const type = interaction.options.getString('type') || 'all';
    const limit = interaction.options.getInteger('number', true);

    if (type === 'all') {
      db.run('INSERT INTO guild_config (guild_id, modlimit_admin, modlimit_mod) VALUES (?, ?, ?) ON CONFLICT(guild_id) DO UPDATE SET modlimit_admin = ?, modlimit_mod = ?',
        [guildId, limit, limit, limit, limit]);
      await interaction.reply(`${emojis.success} Modlimit set to **${limit}** for all.`);
    } else if (type === 'admin') {
      db.run('INSERT INTO guild_config (guild_id, modlimit_admin) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET modlimit_admin = ?',
        [guildId, limit, limit]);
      await interaction.reply(`${emojis.success} Admin modlimit set to **${limit}**.`);
    } else if (type === 'mod') {
      db.run('INSERT INTO guild_config (guild_id, modlimit_mod) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET modlimit_mod = ?',
        [guildId, limit, limit]);
      await interaction.reply(`${emojis.success} Mod modlimit set to **${limit}**.`);
    }
    return;
  }

  if (sub === 'show') {
    const row = db.query('SELECT modlimit_admin, modlimit_mod FROM guild_config WHERE guild_id = ?').get(guildId);
    await interaction.reply(
      `${emojis.info} **Mod Limits**\nAdmin limit: ${row?.modlimit_admin ?? 'No limit'}\nMod limit: ${row?.modlimit_mod ?? 'No limit'}`
    );
    return;
  }

  if (sub === 'reset') {
    db.run('UPDATE guild_config SET modlimit_admin = NULL, modlimit_mod = NULL WHERE guild_id = ?', [guildId]);
    await interaction.reply(`${emojis.success} Modlimits reset to default.`);
    return;
  }
}
