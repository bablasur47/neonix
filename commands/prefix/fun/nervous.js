import { imageCmd } from './_api.js';

export const name = 'nervous';
export const description = 'Get a random nervous reaction GIF.';
export const usage = 'nervous';
export const execute = imageCmd('nervous', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=nervous');
