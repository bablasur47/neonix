import { memeCmd } from '../fun/_api.js';

export const name = 'successkid';
export const description = 'Success kid meme.';
export const usage = 'successkid <text>';
export const execute = memeCmd('successkid', 'https://api.memegen.link/images/success/_/{text}.png', { memegen: true, title: 'Success Kid' });
