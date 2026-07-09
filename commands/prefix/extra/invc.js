import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'invc';
export const description = 'Manage in-voice role assignment and list VC members.';
export const usage = 'invc [subcommand] [@role]';
export const aliases = ['invocal'];

export async function execute(message, args) {
  const sub = args[0]?.toLowerCase();

  if (sub === 'role') {
    if (!canModerate(message.member)) {
      await reply(message, `${emojis.error} You don't have permission.`);
      return;
    }
    await handleRole(message, args.slice(1));
    return;
  }

  if (sub === 'list') {
    await handleList(message);
    return;
  }

  const db = getDb('extra');
  const row = db.query('SELECT role_id FROM invc_roles WHERE guild_id = ?').get(message.guild.id);
  const role = row ? message.guild.roles.cache.get(row.role_id) : null;
  const total = message.guild.members.cache.filter(m => m.voice.channelId).size;

  await reply(message,
    `${emojis.info} **In-Voice Settings**\n` +
    `Role: ${role ? `<@&${role.id}>` : 'None'}\n` +
    `Members in VC: **${total}**\n` +
    `Use \`invc role add/remove\` and \`invc list\``
  );
}

async function handleRole(message, args) {
  const sub = args[0]?.toLowerCase();
  const db = getDb('extra');

  if (sub === 'add') {
    const role = message.mentions.roles.first();
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`invc role add @role\``);
      return;
    }
    db.run('INSERT OR REPLACE INTO invc_roles (guild_id, role_id) VALUES (?, ?)',
      [message.guild.id, role.id]);
    await reply(message, `${emojis.success} **${role.name}** will now be given to users who join a voice channel.`);
    return;
  }

  if (sub === 'remove' || sub === 'delete') {
    db.run('DELETE FROM invc_roles WHERE guild_id = ?', [message.guild.id]);
    await reply(message, `${emojis.success} In-voice role removed.`);
    return;
  }

  await reply(message, `${emojis.warning} Usage: \`invc role add/remove\``);
}

async function handleList(message) {
  const members = message.guild.members.cache.filter(m => m.voice.channelId);
  if (!members.size) {
    await reply(message, `${emojis.info} No members are in voice channels.`);
    return;
  }

  const lines = members.map(m => {
    const ch = m.voice.channel;
    return `**${m.user.tag}** → ${ch ? `<#${ch.id}>` : 'Unknown'}`;
  }).join('\n');

  await reply(message, `${emojis.info} **Members in Voice Channels (${members.size}):**\n${lines.slice(0, 1900)}`);
}
