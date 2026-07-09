import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { isAdmin } from '../../../util/permissions.js';

export const name = 'roleicon';
export const description = 'Set a role icon.';
export const usage = 'roleicon <@role> <emoji>';

export async function execute(message, args) {
  if (!isAdmin(message.member)) {
    await reply(message, `${emojis.error} Only admins can set role icons.`);
    return;
  }

  const role = message.mentions.roles.first();
  const unicode = args[1] || args.slice(1).join(' ');

  if (!role || !unicode) {
    await reply(message, `${emojis.warning} Usage: \`roleicon @role <emoji>\``);
    return;
  }

  try {
    await role.setIcon(unicode);
    await reply(message, `${emojis.success} Role icon set to ${unicode} for **${role.name}**`);
  } catch (err) {
    await reply(message, `${emojis.error} ${err.message}`);
  }
}
