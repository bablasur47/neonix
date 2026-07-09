import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { PermissionsBitField } from 'discord.js';

export const name = 'prefix';
export const aliases = ['setprefix'];
export const description = 'Change or view the bot prefix for this server.';
export const usage = 'prefix [new prefix]';

export async function execute(message, args) {
  const newPrefix = args[0];

  if (!newPrefix) {
    const db = getDb('guilds');
    const row = db.query('SELECT prefix FROM guild_config WHERE guild_id = ?').get(message.guild.id);
    const current = row?.prefix || (await import('../../../util/config.js')).default.initialPrefix;
    await reply(message, `${emojis.info} Current prefix for this server: \`${current}\``);
    return;
  }

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) &&
      !message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
    await reply(message, `${emojis.error} Only administrators or members with Ban Members permission can change the prefix.`);
    return;
  }

  if (newPrefix.length > 5) {
    await reply(message, `${emojis.warning} Prefix must be 5 characters or less.`);
    return;
  }

  if (newPrefix.includes(' ')) {
    await reply(message, `${emojis.warning} Prefix cannot contain spaces.`);
    return;
  }

  const db = getDb('guilds');
  try {
    db.run('INSERT INTO guild_config (guild_id, prefix) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET prefix = ?',
      [message.guild.id, newPrefix, newPrefix]);
    await reply(message, `${emojis.success} Prefix changed to \`${newPrefix}\``);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to change prefix: ${err.message}`);
  }
}
