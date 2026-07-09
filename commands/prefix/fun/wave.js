import { imageCmd } from './_api.js';

export const name = 'wave';
export const description = 'Get a random wave reaction GIF.';
export const usage = 'wave';
export const execute = imageCmd('wave', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=wave');
