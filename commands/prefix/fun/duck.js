import { imageCmd } from './_api.js';

export const name = 'duck';
export const description = 'Get a random duck image.';
export const usage = 'duck';
export const execute = imageCmd('duck', 'duck', 'https://random-d.uk/api/v2/random');
