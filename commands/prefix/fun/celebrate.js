import { imageCmd } from './_api.js';

export const name = 'celebrate';
export const description = 'Get a random celebrate reaction GIF.';
export const usage = 'celebrate';
export const execute = imageCmd('celebrate', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=celebrate');
