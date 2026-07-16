import { imageCmd } from './_api.js';

export const name = 'nope';
export const description = 'Get a random nope reaction GIF.';
export const usage = 'nope';
export const execute = imageCmd('nope', 'nekosbest', 'https://nekos.best/api/v2/nope');
