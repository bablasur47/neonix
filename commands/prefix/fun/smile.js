import { imageCmd } from './_api.js';

export const name = 'smile';
export const description = 'Get a random smile reaction GIF.';
export const usage = 'smile';
export const execute = imageCmd('smile', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=smile');
