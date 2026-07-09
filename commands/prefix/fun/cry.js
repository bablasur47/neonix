import { imageCmd } from './_api.js';

export const name = 'cry';
export const description = 'Get a random cry reaction GIF.';
export const usage = 'cry';
export const execute = imageCmd('cry', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=cry');
