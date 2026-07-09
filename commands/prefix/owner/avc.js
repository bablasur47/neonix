import emojis from '../../../util/emoji.js';
import { imageUrlToDataUri, patchBotUser, isOwner } from '../../../util/guildMember.js';

export const name = 'avc';
export const aliases = ['bioc'];
export const description = 'Change bot global avatar. Owner only.';
export const usage = 'avc <image_url>';

export async function execute(message, args) {
  if (!isOwner(message.author.id)) return;

  const url = args[0];
  if (!url) {
    await message.reply(`${emojis.warning} Usage: \`avc <image_url>\``);
    return;
  }

  await message.reply(`${emojis.loading} Downloading image...`);

  try {
    const avatar = await imageUrlToDataUri(url);
    const res = await patchBotUser({ avatar });

    if (res.ok) {
      await message.reply(`${emojis.success} Global avatar updated!`);
    } else {
      const body = await res.text();
      await message.reply(`${emojis.error} Failed (${res.status}): ${body.slice(0, 500)}`);
    }
  } catch (err) {
    await message.reply(`${emojis.error} ${err.message}`);
  }
}
