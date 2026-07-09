import { imageCmd } from './_api.js';

export const name = 'fuck';
export const description = 'Get a random fuck reaction GIF.';
export const usage = 'fuck';
export const execute = imageCmd('fuck', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=fuck');
