import { imageCmd } from './_api.js';

export const name = 'cuddle';
export const description = 'Get a random cuddle reaction GIF.';
export const usage = 'cuddle';
export const execute = imageCmd('cuddle', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=cuddle');
