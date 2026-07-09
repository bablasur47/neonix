import { imageCmd } from './_api.js';

export const name = 'nuzzle';
export const description = 'Get a random nuzzle reaction GIF.';
export const usage = 'nuzzle';
export const execute = imageCmd('nuzzle', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=nuzzle');
