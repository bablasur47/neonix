import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'role';
export const description = 'Manage roles.';
export const usage = 'role <@user> <@role> [subcommand]';

export async function execute(message, args) {
  const sub = args[0]?.toLowerCase();

  if (sub === 'create') {
    if (!canModerate(message.member)) {
      await reply(message, `${emojis.error} No permission.`);
      return;
    }
    const name = args.slice(1).join(' ') || 'New Role';
    try {
      const role = await message.guild.roles.create({ name, reason: `Created by ${message.author.tag}` });
      await reply(message, `${emojis.success} Role **${role.name}** created.`);
    } catch (err) {
      await reply(message, `${emojis.error} ${err.message}`);
    }
    return;
  }

  if (sub === 'delete') {
    if (!canModerate(message.member)) {
      await reply(message, `${emojis.error} No permission.`);
      return;
    }
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`role delete @role\``);
      return;
    }
    try {
      await role.delete(`Deleted by ${message.author.tag}`);
      await reply(message, `${emojis.success} Role deleted.`);
    } catch (err) {
      await reply(message, `${emojis.error} ${err.message}`);
    }
    return;
  }

  if (sub === 'rename') {
    if (!canModerate(message.member)) {
      await reply(message, `${emojis.error} No permission.`);
      return;
    }
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    const newName = role ? args.slice(2).join(' ') : args.slice(1).join(' ');
    if (!role || !newName) {
      await reply(message, `${emojis.warning} Usage: \`role rename @role <new name>\``);
      return;
    }
    try {
      await role.setName(newName);
      await reply(message, `${emojis.success} Role renamed to **${newName}**`);
    } catch (err) {
      await reply(message, `${emojis.error} ${err.message}`);
    }
    return;
  }

  if (sub === 'all') {
    if (!canModerate(message.member)) {
      await reply(message, `${emojis.error} No permission.`);
      return;
    }
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`role all @role\``);
      return;
    }
    let count = 0;
    for (const member of message.guild.members.cache.values()) {
      if (!member.roles.cache.has(role.id)) {
        try { await member.roles.add(role.id); count++; } catch {}
      }
    }
    await reply(message, `${emojis.success} Added **${role.name}** to ${count} members.`);
    return;
  }

  if (sub === 'bots') {
    if (!canModerate(message.member)) {
      await reply(message, `${emojis.error} No permission.`);
      return;
    }
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`role bots @role\``);
      return;
    }
    let count = 0;
    for (const member of message.guild.members.cache.filter(m => m.user.bot).values()) {
      if (!member.roles.cache.has(role.id)) {
        try { await member.roles.add(role.id); count++; } catch {}
      }
    }
    await reply(message, `${emojis.success} Added **${role.name}** to ${count} bots.`);
    return;
  }

  if (sub === 'humans') {
    if (!canModerate(message.member)) {
      await reply(message, `${emojis.error} No permission.`);
      return;
    }
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`role humans @role\``);
      return;
    }
    let count = 0;
    for (const member of message.guild.members.cache.filter(m => !m.user.bot).values()) {
      if (!member.roles.cache.has(role.id)) {
        try { await member.roles.add(role.id); count++; } catch {}
      }
    }
    await reply(message, `${emojis.success} Added **${role.name}** to ${count} humans.`);
    return;
  }

  if (sub === 'temp') {
    if (!canModerate(message.member)) {
      await reply(message, `${emojis.error} No permission.`);
      return;
    }
    const member = message.mentions.members.first();
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
    const durArg = args[3];
    if (!member || !role || !durArg) {
      await reply(message, `${emojis.warning} Usage: \`role temp @user @role <duration>\` (e.g. 10m, 1h)`);
      return;
    }
    const match = durArg.match(/^(\d+)(m|h|d)$/);
    if (!match) {
      await reply(message, `${emojis.warning} Invalid duration. Use e.g. 10m, 1h, 2d`);
      return;
    }
    const ms = parseInt(match[1]) * ({ m: 60000, h: 3600000, d: 86400000 }[match[2]]);
    try {
      await member.roles.add(role);
      await reply(message, `${emojis.success} Added **${role.name}** to **${member.user.tag}** for ${durArg}.`);
      setTimeout(async () => {
        try { await member.roles.remove(role).catch(() => {}); } catch {}
      }, ms);
    } catch (err) {
      await reply(message, `${emojis.error} ${err.message}`);
    }
    return;
  }

  if (sub === 'status') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`role status @role\``);
      return;
    }
    await reply(message, `${emojis.info} **${role.name}**\nID: \`${role.id}\`\nColor: ${role.hexColor}\nMembers: ${role.members.size}\nPosition: ${role.position}\nHoisted: ${role.hoist}\nMentionable: ${role.mentionable}`);
    return;
  }

  if (sub === 'cancel') {
    await reply(message, `${emojis.info} No pending role operations to cancel.`);
    return;
  }

  if (!sub || args.length === 0) {
    const member = message.mentions.members.first();
    if (!member || !message.mentions.roles.first()) {
      await reply(message, `${emojis.warning} Usage: \`role @user @role\` or \`role create/delete/rename/all/bots/humans/temp/status\``);
      return;
    }
    if (!canModerate(message.member)) {
      await reply(message, `${emojis.error} No permission.`);
      return;
    }
    const role = message.mentions.roles.first();
    try {
      await member.roles.add(role);
      await reply(message, `${emojis.success} Added **${role.name}** to **${member.user.tag}**`);
    } catch (err) {
      await reply(message, `${emojis.error} ${err.message}`);
    }
    return;
  }

  await reply(message, `${emojis.warning} Unknown subcommand. Use \`role @user @role\`, \`role create\`, \`role delete\`, \`role rename\`, \`role all\`, \`role bots\`, \`role humans\`, \`role temp\`, \`role status\``);
}
