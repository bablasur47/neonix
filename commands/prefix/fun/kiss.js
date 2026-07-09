import { imageCmd } from './_api.js';

export const name = 'kiss';
export const description = 'Get a random kiss reaction GIF.';
export const usage = 'kiss';
export const execute = imageCmd('kiss', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=kiss');
