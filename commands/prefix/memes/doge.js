import { memeCmd } from '../fun/_api.js';

export const name = 'doge';
export const description = 'Wow, such doge meme.';
export const usage = 'doge <text 1> | <text 2>';
export const execute = memeCmd('doge', 'https://api.memegen.link/images/doge/{text1}/{text2}.png', { memegen: true, title: 'Doge' });
