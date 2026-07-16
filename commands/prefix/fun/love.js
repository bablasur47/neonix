import { imageCmd } from './_api.js';

export const name = 'love';
export const description = 'Get a random love reaction GIF.';
export const usage = 'love';
export const execute = imageCmd('love', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=love');
