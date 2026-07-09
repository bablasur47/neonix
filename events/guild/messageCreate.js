import { Events, MessageType } from 'discord.js';
import config from '../../util/config.js';
import { getDb } from '../../database/index.js';
import { reply } from '../../util/components.js';
import emojis from '../../util/emoji.js';
import { sendLog, makeEmbed } from '../../util/logger.js';
import log from '../../util/console.js';
import { checkRatelimit } from '../../util/ratelimit.js';

const MAX_ARGS_LENGTH = 50;
const MAX_ARG_SIZE = 1024;

export const name = Events.MessageCreate;

async function hasMedia(msg) {
  if (msg.attachments.size > 0) return true;
  if (msg.embeds.length > 0 && msg.embeds.some(e => e.data.type === 'image' || e.data.type === 'video' || e.data.type === 'gifv')) return true;
  if (msg.stickers.size > 0) return true;
  if (msg.content.match(/https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp|mp4|webm|mov)(\?\S*)?/i)) return true;
  return false;
}

export async function execute(message, client) {
  if (message.author.bot || !message.guild || !message.member) return;

  const db = getDb('afk');
  const afk = db.query(
    'SELECT reason, scope FROM afk_users WHERE user_id = ? AND (guild_id = ? OR scope = ?)'
  ).get(message.author.id, message.guild.id, 'global');

  if (afk) {
    db.run('DELETE FROM afk_users WHERE user_id = ?', [message.author.id]);
    await reply(message, `${emojis.success} Welcome back! Your AFK (**${afk.reason}**) was auto-removed.`);
    return;
  }

  const mediaDb = getDb('media');
  const isMediaChannel = mediaDb.query(
    'SELECT channel_id FROM media_channels WHERE guild_id = ? AND channel_id = ?'
  ).get(message.guild.id, message.channel.id);

  if (isMediaChannel && !(await hasMedia(message))) {
    const bypasses = mediaDb.query(
      'SELECT target_id, type FROM media_bypass WHERE guild_id = ?'
    ).all(message.guild.id);
    const canBypass = bypasses.some(b =>
      (b.type === 'role' && message.member.roles.cache.has(b.target_id)) ||
      (b.type === 'user' && message.author.id === b.target_id)
    );
    if (canBypass) return;

    await message.delete().catch(() => {});
    return;
  }

  const extraDb = getDb('extra');
  const autoresponders = extraDb.query(
    'SELECT trigger, response FROM autoresponder WHERE guild_id = ?'
  ).all(message.guild.id);
  for (const ar of autoresponders) {
    if (!ar.trigger || !ar.response) continue;
    if (message.content.toLowerCase().includes(ar.trigger.toLowerCase())) {
      await message.reply(ar.response).catch(() => {});
      return;
    }
  }

  const guildDb = getDb('guilds');
  const row = guildDb.query('SELECT prefix FROM guild_config WHERE guild_id = ?').get(message.guild.id);
  const prefix = row?.prefix ?? config.initialPrefix;

  if (message.mentions.has(client.user) && message.type !== MessageType.Reply) {
    await message.channel.send(
      `Your prefix here is \`${prefix}\` — here's everything you need to get going.\n\n` +
      `**Quick Commands**\n` +
      `\`${prefix}help\` — Browse all available modules\n` +
      `\`${prefix}help <module>\` — Dive into a specific module\n` +
      `\`${prefix}about\` — Learn more about me`
    );
    return;
  }

  const isNop = checkNoprefix(message.author.id);

  if (!message.content.startsWith(prefix) && !isNop) return;

  if (message.content.length > 2000) return;

  const args = isNop && !message.content.startsWith(prefix)
    ? message.content.trim().split(/ +/)
    : message.content.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();

  if (args.length > MAX_ARGS_LENGTH) {
    await reply(message, `${emojis.error} Too many arguments (max ${MAX_ARGS_LENGTH}).`);
    return;
  }

  for (const arg of args) {
    if (arg.length > MAX_ARG_SIZE) {
      await reply(message, `${emojis.error} Argument too long (max ${MAX_ARG_SIZE} characters).`);
      return;
    }
  }

  const cmd = client.prefixCommands.get(cmdName);
  if (!cmd) return;

  const cooldown = checkRatelimit(message.author.id, cmdName);
  if (cooldown > 0) return;

  try {
    await cmd.execute(message, args, client);

    sendLog([makeEmbed({
      color: 0x5865F2,
      title: 'Command Executed',
      fields: [
        { name: 'Command', value: `**${cmdName}**`, inline: true },
        { name: 'User', value: `**${message.author.username}** (\`${message.author.id}\`)`, inline: true },
        { name: 'Server', value: `**${message.guild.name}** (\`${message.guild.id}\`)`, inline: true },
        { name: 'Channel', value: `<#${message.channel.id}> (\`${message.channel.id}\`)`, inline: true },
        { name: 'Args', value: args.length ? `\`${args.join(' ').slice(0, 500)}\`` : 'None', inline: false },
      ],
    })]);
  } catch (err) {
    log.error(`Prefix command ${cmdName}`, err);
    await reply(message, 'An error occurred while executing that command.');
  }
}

const nopCache = new Map();

export function refreshNopCache() {
  try {
    const db = getDb('noprefix');
    const rows = db.query('SELECT user_id, expires_at FROM nop_users ORDER BY created_at').all();
    nopCache.clear();
    for (const r of rows) nopCache.set(r.user_id, r.expires_at);
  } catch {}
}

function checkNoprefix(userId) {
  if (nopCache.has(userId)) {
    const exp = nopCache.get(userId);
    if (exp && new Date(exp) < new Date()) {
      nopCache.delete(userId);
      try { getDb('noprefix').run('DELETE FROM nop_users WHERE user_id = ?', [userId]); } catch {}
      return false;
    }
    return true;
  }
  try {
    const db = getDb('noprefix');
    const row = db.query('SELECT expires_at FROM nop_users WHERE user_id = ?').get(userId);
    if (!row) return false;
    nopCache.set(userId, row.expires_at);
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      nopCache.delete(userId);
      db.run('DELETE FROM nop_users WHERE user_id = ?', [userId]);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
