import { Events, ChannelType } from 'discord.js';
import { getDb } from '../../database/index.js';
import log from '../../util/console.js';

export const name = Events.VoiceStateUpdate;

export async function execute(oldState, newState) {
  try {
    const member = newState.member;
    if (!member || member.user.bot) return;

    const guild = member.guild;
    const oldChannelId = oldState.channelId;
    const newChannelId = newState.channelId;

    const extraDb = getDb('extra');
    const roleRow = extraDb.query('SELECT role_id FROM invc_roles WHERE guild_id = ?').get(guild.id);
    if (roleRow) {
      const role = guild.roles.cache.get(roleRow.role_id);
      if (role) {
        if (!oldChannelId && newChannelId) {
          await member.roles.add(role).catch(() => {});
        } else if (oldChannelId && !newChannelId) {
          await member.roles.remove(role).catch(() => {});
        }
      }
    }

    const vmDb = getDb('voicemaster');
    const config = vmDb.query('SELECT * FROM vm_config WHERE guild_id = ?').get(guild.id);
    if (!config) return;

    if (newChannelId === config.channel_id) {
      const ownerName = member.user.username;
      const newChannel = await guild.channels.create({
        name: `${ownerName}'s channel`,
        type: ChannelType.GuildVoice,
        parent: config.category_id,
        permissionOverwrites: [
          { id: guild.id, allow: ['Connect', 'Speak'] },
          { id: member.id, allow: ['Connect', 'Speak', 'MuteMembers', 'DeafenMembers', 'MoveMembers', 'ManageChannels'] },
        ],
      });

      vmDb.run('INSERT OR REPLACE INTO vm_channels (channel_id, guild_id, owner_id) VALUES (?, ?, ?)',
        [newChannel.id, guild.id, member.id]);

      await member.voice.setChannel(newChannel.id).catch(() => {});
      return;
    }

    if (oldChannelId && oldChannelId !== config.channel_id) {
      const vmChan = vmDb.query('SELECT * FROM vm_channels WHERE channel_id = ?').get(oldChannelId);
      if (vmChan) {
        const oldChannel = guild.channels.cache.get(oldChannelId);
        if (oldChannel && oldChannel.members.size === 0) {
          vmDb.run('DELETE FROM vm_channels WHERE channel_id = ?', [oldChannelId]);
          await oldChannel.delete().catch(() => {});
        }
      }
    }
  } catch (err) {
    log.error('Voice state update error', err);
  }
}
