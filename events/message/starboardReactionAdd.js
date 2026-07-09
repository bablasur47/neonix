import { Events, EmbedBuilder } from 'discord.js';
import { getDb } from '../../database/index.js';
import log from '../../util/console.js';

export const name = Events.MessageReactionAdd;

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

    if (realCount < config.threshold) return;
    if (!config.self_star && user.id === msg.author.id) return;

    const existing = db.query('SELECT * FROM starboard_messages WHERE guild_id = ? AND original_msg_id = ?').get(guildId, msg.id);

    if (existing?.starboard_msg_id) {
      db.run('UPDATE starboard_messages SET star_count = ? WHERE guild_id = ? AND original_msg_id = ?', [realCount, guildId, msg.id]);
      const channel = reaction.message.guild.channels.cache.get(config.channel_id);
      if (!channel) return;
      const starMsg = await channel.messages.fetch(existing.starboard_msg_id).catch(() => null);
      if (!starMsg) return;
      const embed = buildEmbed(msg, config, realCount);
      await starMsg.edit({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (existing && !existing.starboard_msg_id) {
      db.run('UPDATE starboard_messages SET star_count = ? WHERE guild_id = ? AND original_msg_id = ?', [realCount, guildId, msg.id]);
    }

    if (!existing) {
      db.run('INSERT OR IGNORE INTO starboard_messages (guild_id, original_msg_id, channel_id, author_id, star_count) VALUES (?, ?, ?, ?, ?)',
        [guildId, msg.id, msg.channel.id, msg.author.id, realCount]);
    }

    if (!existing || !existing.starboard_msg_id) {
      const channel = reaction.message.guild.channels.cache.get(config.channel_id);
      if (!channel) return;

      const embed = buildEmbed(msg, config, realCount);
      const embeddedUrl = embed.data.image?.url || embed.data.video?.url;
      const files = config.attachments ? getAttachmentFiles(msg, embeddedUrl) : [];
      const starMsg = await channel.send({ embeds: [embed], files }).catch(() => null);
      if (!starMsg) return;

      db.run('UPDATE starboard_messages SET starboard_msg_id = ? WHERE guild_id = ? AND original_msg_id = ?', [starMsg.id, guildId, msg.id]);
    }
  } catch (err) {
    log.error(`Starboard reaction add error`, err);
  }
}

async function getRealCount(msg, emoji) {
  const reaction = msg.reactions.cache.get(emoji);
  if (!reaction) return 0;
  const users = await reaction.users.fetch();
  return users.filter(u => !u.bot).size;
}

function getAttachmentFiles(msg, excludeUrl) {
  return msg.attachments
    .filter(a => a.url !== excludeUrl && (a.contentType?.startsWith('image/') || a.contentType?.startsWith('video/')))
    .map(a => ({ attachment: a.url, name: a.name }));
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
