import { imageCmd } from './_api.js';

export const name = 'bite';
export const description = 'Get a random bite reaction GIF.';
export const usage = 'bite';
export const execute = imageCmd('bite', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=bite');
