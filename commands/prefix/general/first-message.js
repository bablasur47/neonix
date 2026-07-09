import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'first-message';
export const description = 'Get the first message in the channel.';
export const usage = 'first-message';
export const aliases = ['firstmessage', 'firstmsg'];

export async function execute(message) {
  const messages = await message.channel.messages.fetch({ limit: 1, after: '0' });
  const first = messages.first();

  if (!first) {
    await reply(message, `${emojis.warning} Could not find the first message.`);
    return;
  }

  const content = first.content
    ? first.content.slice(0, 500)
    : '[No text content — may be an embed or attachment]';

  await reply(message, `${emojis.info} **First message** by ${first.author.tag}\n${content}\n[Jump to message](${first.url})`);
}
