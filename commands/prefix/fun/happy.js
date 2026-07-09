import { imageCmd } from './_api.js';

export const name = 'happy';
export const description = 'Get a random happy reaction GIF.';
export const usage = 'happy';
export const execute = imageCmd('happy', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=happy');
