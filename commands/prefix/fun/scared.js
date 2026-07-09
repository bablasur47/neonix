import { imageCmd } from './_api.js';

export const name = 'scared';
export const description = 'Get a random scared reaction GIF.';
export const usage = 'scared';
export const execute = imageCmd('scared', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=scared');
