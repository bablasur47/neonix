import { imageCmd } from './_api.js';

export const name = 'surprised';
export const description = 'Get a random surprised reaction GIF.';
export const usage = 'surprised';
export const execute = imageCmd('surprised', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=surprised');
