import { imageCmd } from './_api.js';

export const name = 'nom';
export const description = 'Get a random nom reaction GIF.';
export const usage = 'nom';
export const execute = imageCmd('nom', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=nom');
