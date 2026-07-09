import { imageCmd } from './_api.js';

export const name = 'tickle';
export const description = 'Get a random tickle reaction GIF.';
export const usage = 'tickle';
export const execute = imageCmd('tickle', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=tickle');
