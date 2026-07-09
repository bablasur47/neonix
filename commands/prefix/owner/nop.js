import emojis from '../../../util/emoji.js';
import { isOwner } from '../../../util/guildMember.js';
import { getDb } from '../../../database/index.js';
import { refreshNopCache } from '../../../events/guild/messageCreate.js';

export const name = 'nop';
export const description = 'Manage no-prefix users. Owner only.';
export const usage = 'nop <add/remove/list> [@user] [duration]';

export async function execute(message, args) {
  if (!isOwner(message.author.id)) return;

  const sub = args[0]?.toLowerCase();

  if (sub === 'add') {
    const target = message.mentions.members.first() || message.mentions.users.first();
    if (!target) {
      await message.reply(`${emojis.warning} Usage: \`nop add @user [duration]\``);
      return;
    }

    const userId = target.id || target.user?.id;
    let expiresAt = null;

    const timeStr = args[2];
    if (timeStr) {
      const match = timeStr.match(/^(\d+)(s|m|h|d)$/);
      if (!match) {
        await message.reply(`${emojis.warning} Invalid duration. Use e.g. \`30s\`, \`5m\`, \`1h\`, \`2d\``);
        return;
      }
      const value = parseInt(match[1]);
      const unit = match[2];
      const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
      expiresAt = new Date(Date.now() + value * multipliers[unit]).toISOString();
    }

    const db = getDb('noprefix');
    db.run(
      'INSERT OR REPLACE INTO nop_users (user_id, added_by, expires_at) VALUES (?, ?, ?)',
      [userId, message.author.id, expiresAt]
    );
    refreshNopCache();

    const expiry = expiresAt ? ` until <t:${Math.floor(new Date(expiresAt).getTime() / 1000)}:R>` : ' permanently';
    await message.reply(`${emojis.success} <@${userId}> added to no-prefix list${expiry}.`);
    return;
  }

  if (sub === 'remove' || sub === 'delete') {
    const target = message.mentions.members.first() || message.mentions.users.first();
    if (!target) {
      await message.reply(`${emojis.warning} Usage: \`nop remove @user\``);
      return;
    }

    const userId = target.id || target.user?.id;
    const db = getDb('noprefix');
    db.run('DELETE FROM nop_users WHERE user_id = ?', [userId]);
    refreshNopCache();
    await message.reply(`${emojis.success} <@${userId}> removed from no-prefix list.`);
    return;
  }

  if (sub === 'list') {
    const db = getDb('noprefix');
    const rows = db.query('SELECT user_id, expires_at FROM nop_users ORDER BY created_at').all();

    if (!rows.length) {
      await message.reply(`${emojis.info} No no-prefix users.`);
      return;
    }

    const now = new Date();
    const list = rows.map(r => {
      let status = 'Permanent';
      if (r.expires_at) {
        const exp = new Date(r.expires_at);
        status = exp < now ? 'Expired' : `<t:${Math.floor(exp.getTime() / 1000)}:R>`;
      }
      return `<@${r.user_id}> — ${status}`;
    }).join('\n');

    await message.reply(`${emojis.info} **No-Prefix Users:**\n${list}`);
    return;
  }

  await message.reply(`${emojis.warning} Usage: \`nop add/remove/list\``);
}
