import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'unban';
export const description = 'Unban a user by ID.';
export const usage = 'unban <user_id>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to unban.`);
    return;
  }

  const id = args[0];
  if (!id) {
    await reply(message, `${emojis.warning} Usage: \`unban <user_id>\``);
    return;
  }

  try {
    await message.guild.members.unban(id);
    await reply(message, `${emojis.success} Unbanned \`${id}\``);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to unban: ${err.message}`);
  }
}
