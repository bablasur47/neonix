import { imageCmd } from './_api.js';

export const name = 'handhold';
export const description = 'Get a random handhold reaction GIF.';
export const usage = 'handhold';
export const execute = imageCmd('handhold', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=handhold');
