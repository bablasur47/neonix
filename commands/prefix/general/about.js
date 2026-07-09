import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import config from '../../../util/config.js';

export const name = 'about';
export const description = 'Show bot information.';
export const usage = 'about';

export async function execute(message, args, client) {
  const info = [
    `${emojis.info} **${client.user.username}**`,
    `Prefix: \`${config.initialPrefix}\``,
    `Servers: ${client.guilds.cache.size}`,
    `Users: ${client.users.cache.size}`,
    `Commands: ${client.commands.size}`,
    `Node.js: ${process.version}`,
    `Runtime: Bun ${Bun.version}`,
    `Library: discord.js`,
  ];

  await reply(message, info);
}
