import { imageCmd } from './_api.js';

export const name = 'laugh';
export const description = 'Get a random laugh reaction GIF.';
export const usage = 'laugh';
export const execute = imageCmd('laugh', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=laugh');
