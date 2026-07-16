import { memeCmd } from './_api.js';

export const name = 'buzz';
export const aliases = ['everywhere'];
export const description = 'X, X everywhere meme.';
export const usage = 'buzz <text 1> | <text 2>';
export const execute = memeCmd('buzz', 'https://api.memegen.link/images/buzz/{text1}/{text2}.png', { memegen: true, title: 'X, X Everywhere' });
