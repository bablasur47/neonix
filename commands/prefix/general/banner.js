import { reply, replyWithImage } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'banner';
export const description = 'Show a user\'s banner or server banner.';
export const usage = 'banner [@user | server | guild]';

export async function execute(message, args) {
  const sub = args[0]?.toLowerCase();

  if (sub === 'server' || sub === 'guild') {
    if (!message.guild.banner) {
      await reply(message, `${emojis.warning} This server has no banner.`);
      return;
    }
    const banner = message.guild.bannerURL({ size: 4096, extension: 'png' });
    await replyWithImage(message, `${emojis.info} Server banner`, banner);
    return;
  }

  const userId = message.mentions.users.first()?.id
    || (sub && !['user', 'server', 'guild'].includes(sub) ? sub : null)
    || message.author.id;

  const user = await message.client.users.fetch(userId, { force: true });
  const banner = user.bannerURL({ size: 4096, extension: 'png' });

  if (!banner) {
    await reply(message, `${emojis.warning} **${user.tag}** has no banner.`);
    return;
  }

  await replyWithImage(message, `${emojis.info} **${user.tag}**'s banner`, banner);
}
