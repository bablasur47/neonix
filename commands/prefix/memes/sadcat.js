import { memeCmd } from '../fun/_api.js';

export const name = 'sadcat';
export const description = 'Sad cat holds up your text.';
export const usage = 'sadcat <text>';
export const execute = memeCmd('sadcat', 'https://api.popcat.xyz/sadcat?text={text}', { title: 'Sad Cat' });
