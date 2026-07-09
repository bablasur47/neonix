import { imageCmd } from './_api.js';

export const name = 'stare';
export const description = 'Get a random stare reaction GIF.';
export const usage = 'stare';
export const execute = imageCmd('stare', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=stare');
