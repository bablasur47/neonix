import { imageCmd } from './_api.js';

export const name = 'redpanda';
export const description = 'Get a random red panda image.';
export const usage = 'redpanda';
export const execute = imageCmd('redpanda', 'fox', 'https://some-random-api.com/animal/red_panda');
