import { imageCmd } from './_api.js';

export const name = 'poke';
export const description = 'Get a random poke reaction GIF.';
export const usage = 'poke';
export const execute = imageCmd('poke', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=poke');
