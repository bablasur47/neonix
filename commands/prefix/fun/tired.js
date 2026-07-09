import { imageCmd } from './_api.js';

export const name = 'tired';
export const description = 'Get a random tired reaction GIF.';
export const usage = 'tired';
export const execute = imageCmd('tired', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=tired');
