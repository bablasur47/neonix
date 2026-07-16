import { imageCmd } from './_api.js';

export const name = 'mad';
export const description = 'Get a random mad reaction GIF.';
export const usage = 'mad';
export const execute = imageCmd('mad', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=mad');
