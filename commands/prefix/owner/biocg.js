import emojis from '../../../util/emoji.js';
import { patchGuildMember, isOwner } from '../../../util/guildMember.js';

export const name = 'biocg';
export const description = 'Change bot guild bio. Owner only.';
export const usage = 'biocg <text>';

export async function execute(message, args) {
  if (!isOwner(message.author.id)) return;

  if (!message.guild) {
    await message.reply(`${emojis.error} This command only works in a server.`);
    return;
  }

  const bio = args.join(' ');
  if (!bio) {
    await message.reply(`${emojis.warning} Usage: \`biocg <your bio text>\``);
    return;
  }

  if (bio.length > 190) {
    await message.reply(`${emojis.error} Bio must be 190 characters or less.`);
    return;
  }

  try {
    const res = await patchGuildMember(message.guild.id, { bio });

    if (res.ok) {
      await message.reply(`${emojis.success} Guild bio updated!`);
    } else {
      const body = await res.text();
      await message.reply(`${emojis.error} Failed (${res.status}): ${body.slice(0, 500)}`);
    }
  } catch (err) {
    await message.reply(`${emojis.error} ${err.message}`);
  }
}
