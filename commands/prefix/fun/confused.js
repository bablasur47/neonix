import { imageCmd } from './_api.js';

export const name = 'confused';
export const description = 'Get a random confused reaction GIF.';
export const usage = 'confused';
export const execute = imageCmd('confused', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=confused');
