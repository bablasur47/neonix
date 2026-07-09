import { imageCmd } from './_api.js';

export const name = 'lick';
export const description = 'Get a random lick reaction GIF.';
export const usage = 'lick';
export const execute = imageCmd('lick', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=lick');
