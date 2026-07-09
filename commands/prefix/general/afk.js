import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from 'discord.js';
import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'afk';
export const description = 'Set AFK, list AFK users, or remove AFK.';
export const usage = 'afk [reason]';

const MOD_PERMS = [
  PermissionsBitField.Flags.KickMembers,
  PermissionsBitField.Flags.BanMembers,
  PermissionsBitField.Flags.ManageMessages,
  PermissionsBitField.Flags.ModerateMembers,
];

export async function execute(message, args) {
  const db = getDb('afk');
  db.run(`CREATE TABLE IF NOT EXISTS afk_users (
    user_id TEXT NOT NULL,
    guild_id TEXT,
    reason TEXT NOT NULL DEFAULT 'AFK',
    scope TEXT NOT NULL DEFAULT 'server',
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, guild_id)
  )`);

  const sub = args[0]?.toLowerCase();

  if (sub === 'list') {
    await handleList(message, db);
    return;
  }

  if (sub === 'remove') {
    await handleRemove(message, args.slice(1), db);
    return;
  }

  if (sub === 'global') {
    await setAfk(message, args.slice(1).join(' ') || 'AFK', 'global', null, db);
    return;
  }

  const reason = args.join(' ') || 'AFK';
  await promptScope(message, reason, db);
}

async function promptScope(message, reason, db) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('afk_server')
      .setLabel('Server Only')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🏠'),
    new ButtonBuilder()
      .setCustomId('afk_global')
      .setLabel('Global')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🌍'),
  );

  const msg = await message.reply({
    content: `${emojis.info} Where should this AFK apply?`,
    components: [row],
  });

  const filter = i => i.user.id === message.author.id;
  const collector = msg.createMessageComponentCollector({ filter, time: 30000, max: 1 });

  collector.on('collect', async (i) => {
    const scope = i.customId === 'afk_global' ? 'global' : 'server';
    await setAfk(message, reason, scope, i, db);
  });

  collector.on('end', async (collected) => {
    if (!collected.size) {
      await msg.edit({ content: `${emojis.warning} AFK setup cancelled (timed out).`, components: [] });
    }
  });
}

async function setAfk(message, reason, scope, interaction, db) {
  const guildId = scope === 'global' ? null : message.guild.id;

  db.run(
    'INSERT OR REPLACE INTO afk_users (user_id, guild_id, reason, scope) VALUES (?, ?, ?, ?)',
    message.author.id, guildId, reason, scope
  );

  const text = `${emojis.info} ${message.author}, you are now **${scope}** AFK: **${reason}**`;

  if (interaction) {
    await interaction.update({ content: text, components: [] });
  } else {
    await reply(message, text);
  }
}

async function handleList(message, db) {
  const isMod = message.member.permissions.any(MOD_PERMS);
  if (!isMod) {
    await reply(message, `${emojis.error} Only moderators can view the AFK list.`);
    return;
  }

  const rows = db.query(
    'SELECT user_id, guild_id, reason, scope, created_at FROM afk_users ORDER BY created_at DESC'
  ).all();

  if (!rows.length) {
    await reply(message, `${emojis.info} No users are currently AFK.`);
    return;
  }

  const lines = rows.map(r => {
    const label = r.scope === 'global' ? 'Global' : `Server ${r.guild_id ? `(${r.guild_id})` : ''}`;
    return `• <@${r.user_id}> — **${r.reason}** [${label}]`;
  });

  await reply(message, [`${emojis.info} **AFK Users** (${rows.length}):`, '---', ...lines]);
}

async function handleRemove(message, args, db) {
  const isMod = message.member.permissions.any(MOD_PERMS);
  if (!isMod) {
    await reply(message, `${emojis.error} Only moderators can remove others' AFK.`);
    return;
  }

  const target = message.mentions.users.first();
  if (!target) {
    await reply(message, `${emojis.warning} Usage: \`afk remove @user\``);
    return;
  }

  const removed = db.run(
    'DELETE FROM afk_users WHERE user_id = ?', target.id
  ).changes;

  if (removed) {
    await reply(message, `${emojis.success} Removed AFK for **${target.tag}**.`);
  } else {
    await reply(message, `${emojis.warning} **${target.tag}** is not AFK.`);
  }
}
