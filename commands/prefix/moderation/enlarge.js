import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'enlarge';
export const description = 'Show a larger version of an emoji.';
export const usage = 'enlarge <emoji>';
export const aliases = ['big', 'jumbo', 'e'];

export async function execute(message, args) {
  const match = args[0]?.match(/<?a?:?(\w+):(\d+)>/);
  if (!match) {
    await reply(message, `${emojis.warning} Usage: \`enlarge :emoji:\``);
    return;
  }

  const animated = args[0].startsWith('<a:');
  const id = match[2];
  const ext = animated ? 'gif' : 'png';
  const url = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=4096&quality=lossless`;

  await reply(message, `${emojis.info} **${match[1]}**`);
  await message.channel.send({ files: [url] });
}
