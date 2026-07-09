import { imageCmd } from './_api.js';

export const name = 'pat';
export const description = 'Get a random pat reaction GIF.';
export const usage = 'pat';
export const execute = imageCmd('pat', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=pat');
