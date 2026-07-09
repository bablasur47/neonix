import { textCmd } from './_api.js';

export const name = 'advice';
export const description = 'Get a random piece of advice.';
export const usage = 'advice';
export const execute = textCmd('advice', 'advice', 'https://api.adviceslip.com/advice');
