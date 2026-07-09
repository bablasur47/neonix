import { textCmd } from './_api.js';

export const name = 'uselessfact';
export const description = 'Get a random useless fact.';
export const usage = 'uselessfact';
export const execute = textCmd('uselessfact', 'uselessfact', 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
