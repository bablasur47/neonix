import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'userinfo';
export const description = 'Show user information.';
export const usage = 'userinfo [@user]';
export const aliases = ['user', 'ui', 'whois'];

export async function execute(message, args) {
  const user = message.mentions.users.first()
    || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null)
    || message.author;

  const member = message.guild.members.cache.get(user.id);
  const flags = user.flags?.toArray() || [];
  const roles = member?.roles.cache
    .filter(r => r.id !== message.guild.id)
    .sort((a, b) => b.position - a.position);

  const info = [
    `${emojis.info} **${user.tag}**`,
    `ID: \`${user.id}\``,
    `Bot: ${user.bot ? 'Yes' : 'No'}`,
    `Created: <t:${Math.floor(user.createdTimestamp / 1000)}:D>`,
    member?.joinedAt ? `Joined: <t:${Math.floor(member.joinedAt / 1000)}:D>` : null,
    roles?.size ? `Roles (${roles.size}): ${roles.map(r => r).join(' ')}` : null,
    flags.length ? `Badges: ${flags.join(', ')}` : null,
  ].filter(Boolean);

  await reply(message, info);
}
