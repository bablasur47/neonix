import { memeCmd } from './_api.js';

export const name = 'unforgivable';
export const description = 'Some sins are unforgivable.';
export const usage = 'unforgivable <text>';
export const execute = memeCmd('unforgivable', 'https://api.popcat.xyz/unforgivable?text={text}', { title: 'Unforgivable' });
