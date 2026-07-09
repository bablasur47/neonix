import { imageCmd } from './_api.js';

export const name = 'dog';
export const description = 'Get a random dog image.';
export const usage = 'dog';
export const execute = imageCmd('dog', 'dog', 'https://dog.ceo/api/breeds/image/random');
