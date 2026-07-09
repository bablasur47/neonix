import { textCmd } from './_api.js';

export const name = 'fact';
export const description = 'Get a random fact.';
export const usage = 'fact';
export const execute = textCmd('fact', 'popfact', 'https://api.popcat.xyz/fact');
