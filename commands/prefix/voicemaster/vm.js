import { ChannelType } from 'discord.js';
import { getDb } from '../../../database/index.js';
import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'vm';
export const description = 'VoiceMaster commands — manage temporary voice channels.';
export const usage = 'vm <setup/delete/lock/unlock/rename/limit/permit/reject/transfer/claim/info> [args]';

export async function execute(message, args) {
  const sub = args[0]?.toLowerCase();
  const vmDb = getDb('voicemaster');
  const guildId = message.guild.id;
  const member = message.member;

  if (!sub) {
    await reply(message, `${emojis.info} **VoiceMaster**\n\`vm setup <#channel> <category>\` — Configure VM\n\`vm delete\` — Remove config\n\`vm lock\` — Lock your VC\n\`vm unlock\` — Unlock your VC\n\`vm rename <name>\` — Rename your VC\n\`vm limit <number>\` — Set user limit\n\`vm permit <@user>\` — Allow user\n\`vm reject <@user>\` — Remove user\n\`vm transfer <@user>\` — Transfer ownership\n\`vm claim\` — Claim ownerless VC\n\`vm info\` — View VC info`);
    return;
  }

  if (sub === 'setup') {
    const channel = message.mentions.channels.first();
    const categoryId = args[2];
    const category = channel?.parent || (categoryId ? message.guild.channels.cache.get(categoryId) : null);

    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await reply(message, `${emojis.warning} Usage: \`vm setup #voice-channel #category\``);
      return;
    }
    if (!category || category.type !== ChannelType.GuildCategory) {
      await reply(message, `${emojis.warning} Usage: \`vm setup #voice-channel #category\``);
      return;
    }

    vmDb.run('INSERT OR REPLACE INTO vm_config (guild_id, channel_id, category_id) VALUES (?, ?, ?)',
      [guildId, channel.id, category.id]);

    await reply(message, `${emojis.success} VoiceMaster set up!\n**Join:** <#${channel.id}>\n**Category:** ${category.name}`);
    return;
  }

  if (sub === 'delete') {
    const config = vmDb.query('SELECT * FROM vm_config WHERE guild_id = ?').get(guildId);
    if (!config) {
      await reply(message, `${emojis.error} VoiceMaster is not configured.`);
      return;
    }
    vmDb.run('DELETE FROM vm_config WHERE guild_id = ?', [guildId]);
    vmDb.run('DELETE FROM vm_channels WHERE guild_id = ?', [guildId]);
    await reply(message, `${emojis.success} VoiceMaster config removed.`);
    return;
  }

  const channel = member.voice.channel;
  if (!channel) {
    await reply(message, `${emojis.error} You must be in a voice channel.`);
    return;
  }

  const vmChan = vmDb.query('SELECT * FROM vm_channels WHERE channel_id = ?').get(channel.id);
  if (!vmChan) {
    await reply(message, `${emojis.error} This is not a temporary voice channel.`);
    return;
  }

  if (sub === 'lock') {
    if (vmChan.owner_id !== member.id) {
      await reply(message, `${emojis.error} You do not own this channel.`);
      return;
    }
    await channel.permissionOverwrites.edit(guildId, { Connect: false });
    await channel.permissionOverwrites.edit(member.id, { Connect: true });
    await reply(message, `${emojis.success} Channel locked! Only you can join.`);
    return;
  }

  if (sub === 'unlock') {
    if (vmChan.owner_id !== member.id) {
      await reply(message, `${emojis.error} You do not own this channel.`);
      return;
    }
    await channel.permissionOverwrites.edit(guildId, { Connect: null });
    await reply(message, `${emojis.success} Channel unlocked! Anyone can join.`);
    return;
  }

  if (sub === 'rename') {
    if (vmChan.owner_id !== member.id) {
      await reply(message, `${emojis.error} You do not own this channel.`);
      return;
    }
    const name = args.slice(1).join(' ').trim();
    if (!name || name.length > 32) {
      await reply(message, `${emojis.warning} Usage: \`vm rename <name>\` (max 32 chars)`);
      return;
    }
    await channel.setName(name);
    await reply(message, `${emojis.success} Channel renamed to **${name}**.`);
    return;
  }

  if (sub === 'limit') {
    if (vmChan.owner_id !== member.id) {
      await reply(message, `${emojis.error} You do not own this channel.`);
      return;
    }
    const limit = parseInt(args[1], 10);
    if (isNaN(limit) || limit < 0 || limit > 99) {
      await reply(message, `${emojis.warning} Usage: \`vm limit <0-99>\` (0 = unlimited)`);
      return;
    }
    await channel.setUserLimit(limit);
    await reply(message, `${emojis.success} User limit set to ${limit === 0 ? 'unlimited' : limit}.`);
    return;
  }

  if (sub === 'permit') {
    if (vmChan.owner_id !== member.id) {
      await reply(message, `${emojis.error} You do not own this channel.`);
      return;
    }
    const target = message.mentions.users.first();
    if (!target) {
      await reply(message, `${emojis.warning} Usage: \`vm permit @user\``);
      return;
    }
    await channel.permissionOverwrites.edit(target.id, { Connect: true });
    await reply(message, `${emojis.success} ${target} can now join your channel.`);
    return;
  }

  if (sub === 'reject') {
    if (vmChan.owner_id !== member.id) {
      await reply(message, `${emojis.error} You do not own this channel.`);
      return;
    }
    const target = message.mentions.users.first();
    if (!target) {
      await reply(message, `${emojis.warning} Usage: \`vm reject @user\``);
      return;
    }
    await channel.permissionOverwrites.edit(target.id, { Connect: false, ViewChannel: false });
    const targetMember = message.guild.members.cache.get(target.id);
    if (targetMember?.voice.channelId === channel.id) {
      await targetMember.voice.disconnect().catch(() => {});
    }
    await reply(message, `${emojis.success} ${target} removed from your channel.`);
    return;
  }

  if (sub === 'transfer') {
    if (vmChan.owner_id !== member.id) {
      await reply(message, `${emojis.error} You do not own this channel.`);
      return;
    }
    const target = message.mentions.users.first();
    if (!target) {
      await reply(message, `${emojis.warning} Usage: \`vm transfer @user\``);
      return;
    }
    const targetMember = message.guild.members.cache.get(target.id);
    if (!targetMember || targetMember.voice.channelId !== channel.id) {
      await reply(message, `${emojis.error} That user is not in your voice channel.`);
      return;
    }
    vmDb.run('UPDATE vm_channels SET owner_id = ? WHERE channel_id = ?', [target.id, channel.id]);
    await reply(message, `${emojis.success} Ownership transferred to ${target}.`);
    return;
  }

  if (sub === 'claim') {
    const owner = message.guild.members.cache.get(vmChan.owner_id);
    if (owner && owner.voice.channelId === channel.id) {
      await reply(message, `${emojis.error} This channel already has an owner.`);
      return;
    }
    vmDb.run('UPDATE vm_channels SET owner_id = ? WHERE channel_id = ?', [member.id, channel.id]);
    await reply(message, `${emojis.success} You are now the owner of this channel.`);
    return;
  }

  if (sub === 'info') {
    const owner = await message.client.users.fetch(vmChan.owner_id).catch(() => null);
    const userLimit = channel.userLimit || 'Unlimited';
    const bitrate = channel.bitrate / 1000;
    const members = channel.members.size;
    const locked = channel.permissionOverwrites.cache.get(guildId)?.deny.has('Connect') ?? false;

    await reply(message,
      `${emojis.info} **Channel Info**\n` +
      `**Name:** ${channel.name}\n` +
      `**Owner:** ${owner ? owner.tag : 'Unknown'}\n` +
      `**Members:** ${members}\n` +
      `**User Limit:** ${userLimit}\n` +
      `**Bitrate:** ${bitrate} kbps\n` +
      `**Locked:** ${locked ? 'Yes' : 'No'}`);
    return;
  }

  await reply(message, `${emojis.warning} Unknown subcommand. Use \`vm\` to see all commands.`);
}
