import { textRaw } from './_api.js';

export const name = 'zen';
export const description = 'Get a random programming wisdom.';
export const usage = 'zen';
export const execute = textRaw('zen', 'https://api.github.com/zen');
