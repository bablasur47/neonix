import { imageCmd } from './_api.js';

export const name = 'wink';
export const description = 'Get a random wink reaction GIF.';
export const usage = 'wink';
export const execute = imageCmd('wink', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=wink');
