import { imageCmd } from './_api.js';

export const name = 'baka';
export const description = 'Get a random baka reaction GIF.';
export const usage = 'baka';
export const execute = imageCmd('baka', 'nekosbest', 'https://nekos.best/api/v2/baka');
