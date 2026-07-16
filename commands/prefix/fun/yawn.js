import { imageCmd } from './_api.js';

export const name = 'yawn';
export const description = 'Get a random yawn reaction GIF.';
export const usage = 'yawn';
export const execute = imageCmd('yawn', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=yawn');
