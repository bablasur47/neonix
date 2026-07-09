import { SlashCommandBuilder } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('modstats')
  .setDescription('Show moderation statistics');

export async function execute(interaction) {
  const db = getDb('moderation');
  const guildId = interaction.guild.id;

  const totalWarns = db.query('SELECT COUNT(*) as c FROM warns WHERE guild_id = ?').get(guildId).c;
  const uniqueUsers = db.query('SELECT COUNT(DISTINCT user_id) as c FROM warns WHERE guild_id = ?').get(guildId).c;
  const topMod = db.query(
    'SELECT moderator_id, COUNT(*) as c FROM warns WHERE guild_id = ? GROUP BY moderator_id ORDER BY c DESC LIMIT 1'
  ).get(guildId);

  const banCount = (await interaction.guild.bans.fetch().catch(() => null))?.size ?? 0;
  const online = interaction.guild.members.cache.filter(m => m.presence?.status === 'online').size;

  await interaction.reply(
    `${emojis.info} **Mod Stats for ${interaction.guild.name}**\n` +
    `Total warnings: **${totalWarns}**\n` +
    `Warned users: **${uniqueUsers}**\n` +
    `Current bans: **${banCount}**\n` +
    `Online members: **${online}**\n` +
    (topMod ? `Top moderator: <@${topMod.moderator_id}> (**${topMod.c}** warns)\n` : '')
  );
}
