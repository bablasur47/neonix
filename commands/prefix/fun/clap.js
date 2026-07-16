import { imageCmd } from './_api.js';

export const name = 'clap';
export const description = 'Get a random clap reaction GIF.';
export const usage = 'clap';
export const execute = imageCmd('clap', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=clap');
