import { textCmd } from './_api.js';

export const name = 'geekjoke';
export const description = 'Get a random geek joke.';
export const usage = 'geekjoke';
export const execute = textCmd('geekjoke', 'geekjoke', 'https://geek-jokes.sameerkumar.website/api?format=json');
