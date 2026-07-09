import { imageCmd } from './_api.js';

export const name = 'cat';
export const description = 'Get a random cat image.';
export const usage = 'cat';
export const execute = imageCmd('cat', 'cat', 'https://api.thecatapi.com/v1/images/search');
