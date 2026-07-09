import { imageCmd } from './_api.js';

export const name = 'dance';
export const description = 'Get a random dance reaction GIF.';
export const usage = 'dance';
export const execute = imageCmd('dance', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=dance');
