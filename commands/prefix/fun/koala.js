import { imageCmd } from './_api.js';

export const name = 'koala';
export const description = 'Get a random koala image.';
export const usage = 'koala';
export const execute = imageCmd('koala', 'fox', 'https://some-random-api.com/animal/koala');
