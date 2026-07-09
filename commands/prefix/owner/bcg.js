import emojis from '../../../util/emoji.js';
import { imageUrlToDataUri, patchGuildMember, isOwner } from '../../../util/guildMember.js';

export const name = 'bcg';
export const description = 'Change bot guild banner. Owner only.';
export const usage = 'bcg <image_url>';

export async function execute(message, args) {
  if (!isOwner(message.author.id)) return;

  if (!message.guild) {
    await message.reply(`${emojis.error} This command only works in a server.`);
    return;
  }

  const url = args[0];
  if (!url) {
    await message.reply(`${emojis.warning} Usage: \`bcg <image_url>\``);
    return;
  }

  await message.reply(`${emojis.loading} Downloading image...`);

  try {
    const banner = await imageUrlToDataUri(url);
    const res = await patchGuildMember(message.guild.id, { banner });

    if (res.ok) {
      await message.reply(`${emojis.success} Guild banner updated!`);
    } else {
      const body = await res.text();
      await message.reply(`${emojis.error} Failed (${res.status}): ${body.slice(0, 500)}`);
    }
  } catch (err) {
    await message.reply(`${emojis.error} ${err.message}`);
  }
}
