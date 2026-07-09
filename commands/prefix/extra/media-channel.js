import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'media-channel';
export const description = 'Add/remove/reset/show media-only channels';
export const usage = 'media channel <add/remove/show/reset> [#channel]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const sub = args[0]?.toLowerCase();
  const db = getDb('media');

  if (sub === 'add') {
    const channel = message.mentions.channels.first() || message.channel;
    db.run('INSERT OR IGNORE INTO media_channels (guild_id, channel_id) VALUES (?, ?)',
      message.guild.id, channel.id);
    await reply(message, `${emojis.success} **#${channel.name}** added as media-only channel.`);
    return;
  }

  if (sub === 'remove') {
    const channel = message.mentions.channels.first();
    if (!channel) {
      await reply(message, `${emojis.warning} Usage: \`media-channel remove #channel\``);
      return;
    }
    db.run('DELETE FROM media_channels WHERE guild_id = ? AND channel_id = ?',
      [message.guild.id, channel.id]);
    await reply(message, `${emojis.success} **#${channel.name}** removed from media channels.`);
    return;
  }

  if (sub === 'reset') {
    db.run('DELETE FROM media_channels WHERE guild_id = ?', [message.guild.id]);
    await reply(message, `${emojis.success} All media channels reset.`);
    return;
  }

  if (sub === 'show' || !sub) {
    const rows = db.query('SELECT channel_id FROM media_channels WHERE guild_id = ?')
      .all(message.guild.id);
    if (!rows.length) {
      await reply(message, `${emojis.info} No media channels set.`);
      return;
    }
    const list = rows.map(r => `<#${r.channel_id}>`).join('\n');
    await reply(message, `${emojis.info} **Media Channels:**\n${list}`);
    return;
  }

  await reply(message, `${emojis.warning} Usage: \`media-channel add/remove/reset/show\``);
}
