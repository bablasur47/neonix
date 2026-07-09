import { Events } from 'discord.js';
import { sendLog, makeEmbed } from '../../util/logger.js';

export const name = Events.GuildDelete;

export async function execute(guild) {
  if (!guild.available) return;

  const embed = makeEmbed({
    color: 0xED4245,
    title: 'Bot Removed from Server',
    fields: [
      { name: 'Server', value: `**${guild.name}** (\`${guild.id}\`)`, inline: false },
      { name: 'Members', value: `${guild.memberCount ?? 'Unknown'}`, inline: true },
      { name: 'Owner', value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`, inline: true },
      { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
    ],
    thumbnail: guild.iconURL({ size: 256 }),
    footer: `Total servers: ${guild.client.guilds.cache.size}`,
  });

  await sendLog([embed]);
}
