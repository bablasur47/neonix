import { imageCmd } from './_api.js';

export const name = 'shrug';
export const description = 'Get a random shrug reaction GIF.';
export const usage = 'shrug';
export const execute = imageCmd('shrug', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=shrug');
