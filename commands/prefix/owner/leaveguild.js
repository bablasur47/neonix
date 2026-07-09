import emojis from '../../../util/emoji.js';
import { isOwner } from '../../../util/guildMember.js';

export const name = 'leaveguild';
export const description = 'Make the bot leave a guild by ID. Owner only.';
export const usage = 'leaveguild <server_id>';

export async function execute(message, args) {
  if (!isOwner(message.author.id)) return;

  const guildId = args[0];
  if (!guildId) {
    await message.reply(`${emojis.warning} Usage: \`leaveguild <server_id>\``);
    return;
  }

  const guild = message.client.guilds.cache.get(guildId);
  if (!guild) {
    await message.reply(`${emojis.error} Not in a guild with ID \`${guildId}\`.`);
    return;
  }

  await message.reply(`${emojis.loading} Leaving **${guild.name}**...`);
  await guild.leave();
}
