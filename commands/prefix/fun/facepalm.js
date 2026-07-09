import { imageCmd } from './_api.js';

export const name = 'facepalm';
export const description = 'Get a random facepalm reaction GIF.';
export const usage = 'facepalm';
export const execute = imageCmd('facepalm', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=facepalm');
