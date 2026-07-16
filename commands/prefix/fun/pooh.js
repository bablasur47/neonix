import { memeCmd } from './_api.js';

export const name = 'pooh';
export const description = 'Regular Pooh vs fancy Pooh meme.';
export const usage = 'pooh <text 1> | <text 2>';
export const execute = memeCmd('pooh', 'https://api.popcat.xyz/pooh?text1={text1}&text2={text2}', { title: 'Tuxedo Pooh' });
