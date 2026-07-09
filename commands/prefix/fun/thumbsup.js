import { imageCmd } from './_api.js';

export const name = 'thumbsup';
export const description = 'Get a random thumbsup reaction GIF.';
export const usage = 'thumbsup';
export const execute = imageCmd('thumbsup', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=thumbsup');
