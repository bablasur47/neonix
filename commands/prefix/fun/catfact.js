import { textCmd } from './_api.js';

export const name = 'catfact';
export const description = 'Get a random cat fact.';
export const usage = 'catfact';
export const execute = textCmd('catfact', 'catfact', 'https://catfact.ninja/fact');
