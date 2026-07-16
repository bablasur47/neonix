import { imageCmd } from './_api.js';

export const name = 'shy';
export const description = 'Get a random shy reaction GIF.';
export const usage = 'shy';
export const execute = imageCmd('shy', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=shy');
