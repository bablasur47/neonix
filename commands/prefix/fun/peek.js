import { imageCmd } from './_api.js';

export const name = 'peek';
export const description = 'Get a random peek reaction GIF.';
export const usage = 'peek';
export const execute = imageCmd('peek', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=peek');
