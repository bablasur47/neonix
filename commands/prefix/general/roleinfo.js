import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'roleinfo';
export const description = 'Show role information.';
export const usage = 'roleinfo <role>';
export const aliases = ['role', 'ri'];

export async function execute(message, args) {
  const roleName = args.join(' ');
  if (!roleName) {
    await reply(message, `${emojis.warning} Usage: \`roleinfo <role name or ID>\``);
    return;
  }

  const role = message.guild.roles.cache.find(r =>
    r.id === roleName || r.name.toLowerCase() === roleName.toLowerCase()
  );

  if (!role) {
    await reply(message, `${emojis.error} Role not found.`);
    return;
  }

  const info = [
    `${emojis.info} **${role.name}**`,
    `ID: \`${role.id}\``,
    `Color: ${role.hexColor}`,
    `Position: ${role.position}`,
    `Members: ${role.members.size}`,
    `Mentionable: ${role.mentionable}`,
    `Hoisted: ${role.hoist}`,
    `Managed: ${role.managed}`,
    `Created: <t:${Math.floor(role.createdTimestamp / 1000)}:D>`,
  ];

  await reply(message, info.join('\n'));
}
