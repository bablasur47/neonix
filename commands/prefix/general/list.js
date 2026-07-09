import { PermissionsBitField } from 'discord.js';
import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'list';
export const description = 'List various server info.';
export const usage = 'list <type> [role]';

const MOD_PERMS = [
  PermissionsBitField.Flags.KickMembers,
  PermissionsBitField.Flags.BanMembers,
  PermissionsBitField.Flags.ManageMessages,
  PermissionsBitField.Flags.ModerateMembers,
];

export async function execute(message, args) {
  const sub = args[0]?.toLowerCase();
  if (!sub) {
    await reply(message, 
      `${emojis.warning} Usage:\n` +
      `\`list admins\` \`list bans\` \`list boosters\` \`list bots\`\n` +
      `\`list botemojis\` \`list emojis\` \`list roles\` \`list mods\`\n` +
      `\`list activedeveloper\` \`list early\` \`list createpos\`\n` +
      `\`list joinpos\` \`list inrole <role>\``
    );
    return;
  }

  const handlers = {
    admins: listAdmins,
    bans: listBans,
    boosters: listBoosters,
    bots: listBots,
    botemojis: listBotEmojis,
    emojis: listEmojis,
    roles: listRoles,
    mods: listMods,
    activedeveloper: listActiveDeveloper,
    early: listEarly,
    createpos: listCreatePos,
    joinpos: listJoinPos,
    inrole: listInRole,
    invoice: listInvoice,
  };

  const handler = handlers[sub];
  if (!handler) {
    await reply(message, `${emojis.warning} Unknown list type: \`${sub}\``);
    return;
  }

  await handler(message, args.slice(1));
}

async function listAdmins(message) {
  const members = message.guild.members.cache.filter(m =>
    m.permissions.has(PermissionsBitField.Flags.Administrator)
  );
  const formatted = members.map(m => `• ${m.user.tag} (\`${m.id}\`)`).join('\n');
  await reply(message, `${emojis.info} **Admins** (${members.size}):\n${formatted || 'None'}`);
}

async function listBans(message) {
  const bans = await message.guild.bans.fetch().catch(() => null);
  if (!bans || !bans.size) {
    await reply(message, `${emojis.info} No bans in this server.`);
    return;
  }
  const formatted = bans.map(b => `• ${b.user.tag} (\`${b.user.id}\`)`).join('\n');
  await reply(message, `${emojis.info} **Bans** (${bans.size}):\n${formatted}`);
}

async function listBoosters(message) {
  const boosters = message.guild.members.cache.filter(m => m.premiumSince);
  if (!boosters.size) {
    await reply(message, `${emojis.info} No boosters in this server.`);
    return;
  }
  const formatted = boosters.map(m => `• ${m.user.tag} — boosting since <t:${Math.floor(m.premiumSince / 1000)}:D>`).join('\n');
  await reply(message, `${emojis.info} **Boosters** (${boosters.size}):\n${formatted.slice(0, 1900)}`);
}

async function listBots(message) {
  const bots = message.guild.members.cache.filter(m => m.user.bot);
  if (!bots.size) {
    await reply(message, `${emojis.info} No bots in this server.`);
    return;
  }
  const formatted = bots.map(m => `• ${m.user.tag} (\`${m.id}\`)`).join('\n');
  await reply(message, `${emojis.info} **Bots** (${bots.size}):\n${formatted}`);
}

async function listBotEmojis(message) {
  const emojisList = message.guild.emojis.cache.filter(e => e.managed);
  if (!emojisList.size) {
    await reply(message, `${emojis.info} No managed/bot emojis in this server.`);
    return;
  }
  const formatted = emojisList.map(e => `${e} — \`:${e.name}:\``).join('\n');
  await reply(message, `${emojis.info} **Bot Emojis** (${emojisList.size}):\n${formatted}`);
}

async function listEmojis(message) {
  const all = message.guild.emojis.cache;
  if (!all.size) {
    await reply(message, `${emojis.info} No emojis in this server.`);
    return;
  }
  const formatted = all.map(e => `${e} — \`:${e.name}:\``).join('\n');
  await reply(message, `${emojis.info} **Emojis** (${all.size}):\n${formatted}`);
}

async function listRoles(message) {
  const roles = message.guild.roles.cache
    .filter(r => r.id !== message.guild.id)
    .sort((a, b) => b.position - a.position);
  if (!roles.size) {
    await reply(message, `${emojis.info} No roles in this server.`);
    return;
  }
  const formatted = roles.map(r => `• ${r} — **${r.members.size}** members`).join('\n');
  await reply(message, `${emojis.info} **Roles** (${roles.size}):\n${formatted.slice(0, 1900)}`);
}

async function listMods(message) {
  const mods = message.guild.members.cache.filter(m =>
    MOD_PERMS.some(p => m.permissions.has(p))
  );
  if (!mods.size) {
    await reply(message, `${emojis.info} No mods in this server.`);
    return;
  }
  const formatted = mods.map(m => `• ${m.user.tag} (\`${m.id}\`)`).join('\n');
  await reply(message, `${emojis.info} **Mods** (${mods.size}):\n${formatted}`);
}

async function listActiveDeveloper(message) {
  const devs = message.guild.members.cache.filter(m => {
    const flags = m.user.flags?.toArray() || [];
    return flags.includes('ActiveDeveloper');
  });
  if (!devs.size) {
    await reply(message, `${emojis.info} No Active Developers found in this server.`);
    return;
  }
  const formatted = devs.map(m => `• ${m.user.tag} (\`${m.id}\`)`).join('\n');
  await reply(message, `${emojis.info} **Active Developers** (${devs.size}):\n${formatted}`);
}

async function listEarly(message) {
  const sorted = message.guild.members.cache
    .filter(m => m.joinedAt)
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .first(20);
  const formatted = sorted.map((m, i) => `#${i + 1} ${m.user.tag} — <t:${Math.floor(m.joinedAt / 1000)}:D>`).join('\n');
  await reply(message, `${emojis.info} **Earliest members** (top 20):\n${formatted}`);
}

async function listCreatePos(message) {
  const sorted = message.guild.members.cache
    .filter(m => m.user.createdAt)
    .sort((a, b) => a.user.createdAt - b.user.createdAt)
    .first(20);
  const formatted = sorted.map((m, i) => `#${i + 1} ${m.user.tag} — created <t:${Math.floor(m.user.createdAt / 1000)}:D>`).join('\n');
  await reply(message, `${emojis.info} **Oldest accounts** (top 20):\n${formatted}`);
}

async function listJoinPos(message) {
  const sorted = message.guild.members.cache
    .filter(m => m.joinedAt)
    .sort((a, b) => a.joinedAt - b.joinedAt);
  const pos = sorted.keyArray().indexOf(message.author.id) + 1;
  await reply(message, `${emojis.info} **${message.author.tag}** is join position **#${pos}** of ${sorted.size} members.`);
}

async function listInRole(message, args) {
  const roleName = args.join(' ');
  if (!roleName) {
    await reply(message, `${emojis.warning} Usage: \`list inrole <role name or ID>\``);
    return;
  }

  const role = message.guild.roles.cache.find(r =>
    r.id === roleName || r.name.toLowerCase() === roleName.toLowerCase()
  );
  if (!role) {
    await reply(message, `${emojis.error} Role not found: \`${roleName}\``);
    return;
  }

  const members = role.members;
  if (!members.size) {
    await reply(message, `${emojis.info} No members in role **${role.name}**.`);
    return;
  }

  const formatted = members.map(m => `• ${m.user.tag} (\`${m.id}\`)`).join('\n');
  await reply(message, `${emojis.info} **${role.name}** (${members.size} members):\n${formatted.slice(0, 1900)}`);
}

async function listInvoice(message) {
  const invites = await message.guild.invites.fetch().catch(() => null);
  if (!invites?.size) {
    await reply(message, `${emojis.info} No invites for this server.`);
    return;
  }
  const total = invites.reduce((sum, i) => sum + (i.uses || 0), 0);
  const top = invites.sort((a, b) => (b.uses || 0) - (a.uses || 0)).first(5);
  const formatted = top.map(i => `• ${i.code} — **${i.uses || 0}** uses${i.inviter ? ` by ${i.inviter.tag}` : ''}`).join('\n');
  await reply(message, `${emojis.info} **Invites** (total ${total} uses, top 5):\n${formatted}`);
}
