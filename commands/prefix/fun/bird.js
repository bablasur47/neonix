import { imageCmd } from './_api.js';

export const name = 'bird';
export const description = 'Get a random bird image.';
export const usage = 'bird';
export const execute = imageCmd('bird', 'fox', 'https://some-random-api.com/animal/bird');
