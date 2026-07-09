import { Events, ChannelType } from 'discord.js';
import { sendLog, makeEmbed } from '../../util/logger.js';

export const name = Events.GuildCreate;

export async function execute(guild) {
  const owner = await guild.fetchOwner().catch(() => null);
  const channels = guild.channels.cache;
  const textChannels = channels.filter(c => c.type === ChannelType.GuildText);

   const invite = await textChannels.first()?.createInvite({
     maxAge: 0, maxUses: 0, reason: 'Bot logging'
   }).catch(() => null);

  const embed = makeEmbed({
    color: 0x57F287,
    title: 'Bot Added to Server',
    fields: [
      { name: 'Server', value: `**${guild.name}** (\`${guild.id}\`)`, inline: false },
      { name: 'Owner', value: owner ? `**${owner.user.tag}** (\`${owner.id}\`)` : 'Unknown', inline: true },
      { name: 'Members', value: `${guild.memberCount}`, inline: true },
      { name: 'Channels', value: `${guild.channels.cache.size} total`, inline: true },
      { name: 'Boost Level', value: `Level ${guild.premiumTier}`, inline: true },
      { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
    ],
    thumbnail: guild.iconURL({ size: 256 }),
    footer: `Total servers: ${guild.client.guilds.cache.size}`,
  });

  await sendLog([embed]);

  if (invite) {
    const inviteEmbed = makeEmbed({
      title: 'Invite Link',
      description: `[discord.gg/${invite.code}](https://discord.gg/${invite.code})`,
    });
    await sendLog([inviteEmbed]);
  }
}
