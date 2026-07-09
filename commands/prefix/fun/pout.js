import { imageCmd } from './_api.js';

export const name = 'pout';
export const description = 'Get a random pout reaction GIF.';
export const usage = 'pout';
export const execute = imageCmd('pout', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=pout');
