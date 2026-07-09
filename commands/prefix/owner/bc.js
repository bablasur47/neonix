import emojis from '../../../util/emoji.js';
import { imageUrlToDataUri, patchBotUser, isOwner } from '../../../util/guildMember.js';

export const name = 'bc';
export const description = 'Change bot global banner. Owner only.';
export const usage = 'bc <image_url>';

export async function execute(message, args) {
  if (!isOwner(message.author.id)) return;

  const url = args[0];
  if (!url) {
    await message.reply(`${emojis.warning} Usage: \`bc <image_url>\``);
    return;
  }

  await message.reply(`${emojis.loading} Downloading image...`);

  try {
    const banner = await imageUrlToDataUri(url);
    const res = await patchBotUser({ banner });

    if (res.ok) {
      await message.reply(`${emojis.success} Global banner updated!`);
    } else {
      const body = await res.text();
      await message.reply(`${emojis.error} Failed (${res.status}): ${body.slice(0, 500)}`);
    }
  } catch (err) {
    await message.reply(`${emojis.error} ${err.message}`);
  }
}
