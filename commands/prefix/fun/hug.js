import { imageCmd } from './_api.js';

export const name = 'hug';
export const description = 'Get a random hug reaction GIF.';
export const usage = 'hug';
export const execute = imageCmd('hug', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=hug');
