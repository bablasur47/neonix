import { textCmd } from './_api.js';

export const name = 'joke';
export const description = 'Get a random joke.';
export const usage = 'joke';
export const execute = textCmd('joke', 'popjoke', 'https://api.popcat.xyz/joke');
