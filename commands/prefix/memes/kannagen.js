import { memeCmd } from '../fun/_api.js';

export const name = 'kannagen';
export const aliases = ['kanna'];
export const description = 'Kanna holds up your text.';
export const usage = 'kannagen <text>';
export const execute = memeCmd('kannagen', 'https://nekobot.xyz/api/imagegen?type=kannagen&text={text}', { title: 'Kanna' });
