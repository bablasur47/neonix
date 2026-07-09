import { imageCmd } from './_api.js';

export const name = 'smug';
export const description = 'Get a random smug reaction GIF.';
export const usage = 'smug';
export const execute = imageCmd('smug', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=smug');
