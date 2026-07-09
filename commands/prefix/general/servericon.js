import { reply, replyWithImage } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'servericon';
export const description = 'Show server icon.';
export const usage = 'servericon';
export const aliases = ['guildicon', 'sicon'];

export async function execute(message) {
  const icon = message.guild.iconURL({ size: 4096, extension: 'png' });
  if (!icon) {
    await reply(message, `${emojis.warning} This server has no icon.`);
    return;
  }

  await replyWithImage(message, `${emojis.info} **${message.guild.name}**'s icon`, icon);
}
