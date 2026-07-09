import { textCmd } from './_api.js';

export const name = '8ball';
export const description = 'Ask the magic 8 ball a question.';
export const usage = '8ball';
export const execute = textCmd('8ball', 'eightball', 'https://api.popcat.xyz/8ball');
