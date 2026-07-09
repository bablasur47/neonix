import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'rrole';
export const description = 'Remove roles from users.';
export const usage = 'rrole [@user] [@role] [subcommand]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const sub = args[0]?.toLowerCase();

  if (sub === 'all') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`rrole all @role\``);
      return;
    }
    let count = 0;
    for (const member of role.members.values()) {
      try { await member.roles.remove(role.id); count++; } catch {}
    }
    await reply(message, `${emojis.success} Removed **${role.name}** from ${count} members.`);
    return;
  }

  if (sub === 'bots') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`rrole bots @role\``);
      return;
    }
    let count = 0;
    for (const member of role.members.filter(m => m.user.bot).values()) {
      try { await member.roles.remove(role.id); count++; } catch {}
    }
    await reply(message, `${emojis.success} Removed **${role.name}** from ${count} bots.`);
    return;
  }

  if (sub === 'humans') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`rrole humans @role\``);
      return;
    }
    let count = 0;
    for (const member of role.members.filter(m => !m.user.bot).values()) {
      try { await member.roles.remove(role.id); count++; } catch {}
    }
    await reply(message, `${emojis.success} Removed **${role.name}** from ${count} humans.`);
    return;
  }

  if (sub === 'status') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`rrole status @role\``);
      return;
    }
    await reply(message, `${emojis.info} **${role.name}** — ${role.members.size} members have this role.`);
    return;
  }

  if (sub === 'cancel') {
    await reply(message, `${emojis.info} No pending operations to cancel.`);
    return;
  }

  const member = message.mentions.members.first();
  const role = message.mentions.roles.first();
  if (!member || !role) {
    await reply(message, `${emojis.warning} Usage: \`rrole @user @role\` or \`rrole all/bots/humans/cancel\``);
    return;
  }

  try {
    await member.roles.remove(role);
    await reply(message, `${emojis.success} Removed **${role.name}** from **${member.user.tag}**`);
  } catch (err) {
    await reply(message, `${emojis.error} ${err.message}`);
  }
}
