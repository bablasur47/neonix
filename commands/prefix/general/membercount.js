import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'membercount';
export const description = 'Show server member count.';
export const usage = 'membercount';
export const aliases = ['mc', 'members'];

export async function execute(message) {
  const guild = message.guild;
  const total = guild.memberCount;
  const humans = guild.members.cache.filter(m => !m.user.bot).size;
  const bots = guild.members.cache.filter(m => m.user.bot).size;

  await reply(message, 
    `${emojis.info} **${guild.name}**\n` +
    `Total: **${total}**\n` +
    `Humans: **${humans}**\n` +
    `Bots: **${bots}**`
  );
}
