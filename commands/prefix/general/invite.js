import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import config from '../../../util/config.js';

export const name = 'invite';
export const description = 'Get bot invite link.';
export const usage = 'invite';

export async function execute(message) {
  const url = `https://discord.com/oauth2/authorize?client_id=${config.clientId}&scope=bot%20applications.commands&permissions=8`;

  await reply(message, `${emojis.info} Invite me: ${url}`);
}
