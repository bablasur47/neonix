import { Events, EmbedBuilder } from 'discord.js';
import { getDb } from '../../database/index.js';
import log from '../../util/console.js';

export const name = Events.MessageReactionRemove;

export async function execute(reaction, user) {
  try {
    if (user.bot || !reaction.message.guild) return;

    const guildId = reaction.message.guild.id;
    const db = getDb('starboard');
    const config = db.query('SELECT * FROM starboard_config WHERE guild_id = ?').get(guildId);

    if (!config?.channel_id || config.locked) return;
    if (reaction.emoji.name !== config.emoji) return;

    const ignored = db.query('SELECT * FROM starboard_ignored WHERE guild_id = ? AND channel_id = ?').all(guildId, reaction.message.channel.id);
    if (ignored.length > 0) return;

    const msg = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
    const realCount = await getRealCount(msg, config.emoji);
    const existing = db.query('SELECT * FROM starboard_messages WHERE guild_id = ? AND original_msg_id = ?').get(guildId, msg.id);

    if (!existing?.starboard_msg_id) return;

    const channel = reaction.message.guild.channels.cache.get(config.channel_id);
    if (!channel) return;

    if (realCount < config.threshold) {
      const starMsg = await channel.messages.fetch(existing.starboard_msg_id).catch(() => null);
      if (starMsg) await starMsg.delete().catch(() => {});
      db.run('DELETE FROM starboard_messages WHERE guild_id = ? AND original_msg_id = ?', [guildId, msg.id]);
      return;
    }

    db.run('UPDATE starboard_messages SET star_count = ? WHERE guild_id = ? AND original_msg_id = ?', [realCount, guildId, msg.id]);

    const starMsg = await channel.messages.fetch(existing.starboard_msg_id).catch(() => null);
    if (!starMsg) return;

    const embed = buildEmbed(msg, config, realCount);
    await starMsg.edit({ embeds: [embed] }).catch(() => {});
  } catch (err) {
    log.error(`Starboard reaction remove error`, err);
  }
}

async function getRealCount(msg, emoji) {
  const reaction = msg.reactions.cache.get(emoji);
  if (!reaction) return 0;
  const users = await reaction.users.fetch();
  return users.filter(u => !u.bot).size;
}

function buildEmbed(msg, config, count) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
    .setDescription(msg.content || '_No text content_')
    .setColor(parseInt(config.color.replace('#', ''), 16) || 0xFFD700)
    .setFooter({ text: `⭐ ${count} | ${msg.id}` })
    .setTimestamp();

  if (config.jump_url) {
    embed.setURL(msg.url);
  }

  if (config.attachments && msg.attachments.size > 0) {
    const img = msg.attachments.find(a => a.contentType?.startsWith('image/'));
    const video = msg.attachments.find(a => a.contentType?.startsWith('video/'));
    if (img) {
      embed.setImage(img.url);
    } else if (video) {
      embed.setVideo(video.url);
    }
  }

  return embed;
}
