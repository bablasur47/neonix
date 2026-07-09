import { EmbedBuilder } from 'discord.js';
import { reply } from '../../../util/components.js';

export const name = 'serverinfo';
export const description = 'Show detailed server information.';
export const usage = 'serverinfo';
export const aliases = ['server', 'guild', 'si', 'gi'];

export async function execute(message) {
  const g = message.guild;
  const owner = await g.fetchOwner().catch(() => null);

  const textCh = g.channels.cache.filter(c => c.type === 0).size;
  const voiceCh = g.channels.cache.filter(c => c.type === 2).size;
  const catCh = g.channels.cache.filter(c => c.type === 4).size;

  const totalEmojis = g.emojis.cache.size;
  const animEmojis = g.emojis.cache.filter(e => e.animated).size;
  const staticEmojis = totalEmojis - animEmojis;

  const totalRoles = g.roles.cache.size;
  const managedRoles = g.roles.cache.filter(r => r.managed).size;

  const created = Math.floor(g.createdTimestamp / 1000);
  const now = Math.floor(Date.now() / 1000);
  const age = Math.floor((now - created) / 86400);

  const acronym = g.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4);

  const shardInfo = g.shardId !== undefined
    ? `${g.shardId}/${message.client.shard?.count ?? 1}`
    : 'N/A';

  const features = g.features?.length
    ? g.features.map(f => f.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).join('\n')
    : 'None';

  const embed = new EmbedBuilder()
    .setTitle(`${g.name}`)
    .setThumbnail(g.iconURL({ size: 1024 }))
    .setColor(0x2B2D31)

    .addFields(
      {
        name: 'Information',
        value: `\`\`\`prolog\nAcronym     : ${acronym}\nCreated     : ${age} days ago\nID          : ${g.id}\nLocale      : ${g.preferredLocale || 'Unknown'}\nNitro Tier  : ${g.premiumTier ? `Tier ${g.premiumTier}` : 'None'}\nOwner       : @${owner?.user?.username || 'Unknown'}\nRegion      : ${g.preferredLocale || 'Unknown'}\nServer Type : ${g.vanityURLCode ? 'Public' : 'Private'}\nShard       : ${shardInfo}\`\`\``,
        inline: false,
      },
      {
        name: 'Moderation',
        value: `\`\`\`prolog\nAFK Timeout    : ${g.afkTimeout} seconds\nContent Filter : ${g.nsfwLevel === 1 ? 'Disabled' : g.nsfwLevel === 2 ? 'Medium' : 'Strict'}\nMessage Notifs : ${g.defaultMessageNotifications === 0 ? 'All' : 'Mentions'}\nMFA            : ${g.mfaLevel === 0 ? 'Optional' : 'Required'}\nVerification   : ${['None', 'Low', 'Medium', 'High', 'Very High'][g.verificationLevel]}\`\`\``,
        inline: false,
      },
      {
        name: 'Channels',
        value: `\`\`\`prolog\nDefault : ${g.systemChannel?.name || 'None'}\nSystem  : ${g.systemChannel?.name || 'None'}\`\`\``,
        inline: true,
      },
      {
        name: 'Counts',
        value: `\`\`\`prolog\nChannels     : ${textCh + voiceCh + catCh}\n -[Category] : ${catCh}\n -[Text]     : ${textCh}\n -[Voice]    : ${voiceCh}\nEmojis       : ${totalEmojis}\n -[Anim]     : ${animEmojis}\n -[Regular]  : ${staticEmojis}\nBoosts       : ${g.premiumSubscriptionCount || 0}\nMembers      : ${g.memberCount}\nOverwrites   : ${g.channels.cache.reduce((s, c) => s + c.permissionOverwrites.cache.size, 0)}\nPresences    : ${g.presences?.cache?.size ?? '?'}\nRoles        : ${totalRoles}\n -[Managed]  : ${managedRoles}\n -[Regular]  : ${totalRoles - managedRoles}\nVoiceStates  : ${g.voiceStates?.cache?.size ?? 0}\`\`\``,
        inline: true,
      },
      {
        name: 'Limits',
        value: `\`\`\`prolog\nAttachment : ${g.maxMembers ? '10 MB' : '10 MB'}\nBitrate    : ${g.maxBitrate ? `${g.maxBitrate / 1000} kbps` : '96 kbps'}\nEmojis     : ${g.maxEmojis || 100}\n -[Anim]   : ${g.maxAnimatedEmojis || 50}\n -[Regular]: ${(g.maxEmojis || 100) - (g.maxAnimatedEmojis || 50)}\nMembers    : ${g.maxMembers?.toLocaleString() || '25,000,000'}\nPresences  : ${(g.maxPresences || 5000).toLocaleString()}\`\`\``,
        inline: true,
      },
      {
        name: 'Features',
        value: `\`\`\`prolog\n${features}\`\`\``,
        inline: false,
      }
    );

  await message.reply({ embeds: [embed] });
}
