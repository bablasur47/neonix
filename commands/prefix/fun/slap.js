import { imageCmd } from './_api.js';

export const name = 'slap';
export const description = 'Get a random slap reaction GIF.';
export const usage = 'slap';
export const execute = imageCmd('slap', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=slap');
