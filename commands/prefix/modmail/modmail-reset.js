import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'modmail-reset';
export const description = 'Reset the modmail system in this server.';
export const usage = 'modmail-reset';
export const aliases = ['mm-reset'];

export async function execute(message) {
  if (!message.member.permissions.has('Administrator')) {
    await reply(message, `${emojis.error} You need Administrator permission.`);
    return;
  }

  const db = getDb('modmail');
  const config = db.query('SELECT * FROM modmail_config WHERE guild_id = ?').get(message.guild.id);
  if (!config) {
    await reply(message, `${emojis.warning} Modmail is not setup in this server.`);
    return;
  }

  const logChannel = message.guild.channels.cache.get(config.log_channel_id);
  if (logChannel) {
    await logChannel.delete('Modmail reset').catch(() => {});
  }

  db.run('DELETE FROM modmail_config WHERE guild_id = ?', [message.guild.id]);
  db.run('DELETE FROM modmail_tickets WHERE guild_id = ?', [message.guild.id]);
  db.run('DELETE FROM modmail_blocked WHERE guild_id = ?', [message.guild.id]);
  db.run('DELETE FROM modmail_roles WHERE guild_id = ?', [message.guild.id]);

  const publicChannel = message.guild.channels.cache.get(config.channel_id);
  if (publicChannel) {
    const messages = await publicChannel.messages.fetch({ limit: 20 });
    const modmailMsg = messages.find(m =>
      m.author.id === message.client.user.id &&
      m.embeds?.length > 0 &&
      m.embeds[0]?.title === 'Modmail System'
    );
    if (modmailMsg) await modmailMsg.delete().catch(() => {});
  }

  await reply(message, `${emojis.success} Modmail system has been reset.`);
}
