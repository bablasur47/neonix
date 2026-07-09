import { imageCmd } from './_api.js';

export const name = 'blush';
export const description = 'Get a random blush reaction GIF.';
export const usage = 'blush';
export const execute = imageCmd('blush', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=blush');
