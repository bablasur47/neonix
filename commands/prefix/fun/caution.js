import { memeCmd } from './_api.js';

export const name = 'caution';
export const description = 'Caution sign with your text.';
export const usage = 'caution <text>';
export const execute = memeCmd('caution', 'https://api.popcat.xyz/caution?text={text}', { title: 'Caution' });
