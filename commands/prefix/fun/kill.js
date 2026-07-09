import { imageCmd } from './_api.js';

export const name = 'kill';
export const description = 'Get a random kill reaction GIF.';
export const usage = 'kill';
export const execute = imageCmd('kill', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=kill');
