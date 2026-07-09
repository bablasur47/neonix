import { textCmd } from './_api.js';

export const name = 'kanye';
export const description = 'Get a random Kanye West quote.';
export const usage = 'kanye';
export const execute = textCmd('kanye', 'kanye', 'https://api.kanye.rest/');
