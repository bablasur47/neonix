import { imageCmd } from './_api.js';

export const name = 'sad';
export const description = 'Get a random sad reaction GIF.';
export const usage = 'sad';
export const execute = imageCmd('sad', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=sad');
