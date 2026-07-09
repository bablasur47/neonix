import { imageCmd } from './_api.js';

export const name = 'meme';
export const description = 'Get a random meme.';
export const usage = 'meme';
export const execute = imageCmd('meme', 'meme', 'https://api.popcat.xyz/meme');
