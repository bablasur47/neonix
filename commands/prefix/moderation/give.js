import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'give';
export const description = 'Give a role to a user.';
export const usage = 'give <@user> <@role>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const member = message.mentions.members.first();
  const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

  if (!member || !role) {
    await reply(message, `${emojis.warning} Usage: \`give @user @role\``);
    return;
  }

  try {
    await member.roles.add(role);
    await reply(message, `${emojis.success} Gave **${role.name}** to **${member.user.tag}**`);
  } catch (err) {
    await reply(message, `${emojis.error} ${err.message}`);
  }
}
