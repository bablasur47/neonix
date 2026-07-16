import { imageCmd } from './_api.js';

export const name = 'panda';
export const description = 'Get a random panda image.';
export const usage = 'panda';
export const execute = imageCmd('panda', 'fox', 'https://some-random-api.com/animal/panda');
