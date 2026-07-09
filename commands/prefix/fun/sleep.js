import { imageCmd } from './_api.js';

export const name = 'sleep';
export const description = 'Get a random sleep reaction GIF.';
export const usage = 'sleep';
export const execute = imageCmd('sleep', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=sleep');
