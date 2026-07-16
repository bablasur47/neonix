import { memeCmd } from './_api.js';

export const name = 'alert';
export const description = 'iPhone alert with your text.';
export const usage = 'alert <text>';
export const execute = memeCmd('alert', 'https://api.popcat.xyz/alert?text={text}', { title: 'Alert' });
