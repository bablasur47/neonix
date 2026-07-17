import { memeCmd } from '../fun/_api.js';

export const name = 'spongebob';
export const aliases = ['mock'];
export const description = 'Mocking Spongebob meme.';
export const usage = 'spongebob <text>';
export const execute = memeCmd('spongebob', 'https://api.memegen.link/images/spongebob/_/{text}.png', { memegen: true, title: 'Mocking Spongebob' });
