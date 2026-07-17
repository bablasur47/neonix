import { memeCmd } from '../fun/_api.js';

export const name = 'opinion';
export const description = 'Share your (bad) opinion.';
export const usage = 'opinion [@user] <text>';
export const execute = memeCmd('opinion', 'https://api.popcat.xyz/opinion?image={avatar}&text={text}', { usage: 'opinion [@user] <text>' });
