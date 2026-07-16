import { memeCmd } from './_api.js';

export const name = 'changemymind';
export const aliases = ['cmm'];
export const description = 'Change my mind meme with your text.';
export const usage = 'changemymind <text>';
export const execute = memeCmd('changemymind', 'https://nekobot.xyz/api/imagegen?type=changemymind&text={text}', { title: 'Change My Mind' });
