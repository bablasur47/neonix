import { replyWithImage } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'avatar';
export const description = 'Show a user\'s avatar.';
export const usage = 'avatar [@user]';
export const aliases = ['av', 'pfp'];

export async function execute(message, args) {
  const user = message.mentions.users.first()
    || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null)
    || message.author;

  const avatar = user.displayAvatarURL({ size: 4096, extension: 'png' });

  await replyWithImage(message, `${emojis.info} **${user.tag}**'s avatar`, avatar);
}
