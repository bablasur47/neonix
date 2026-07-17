import { memeCmd } from '../fun/_api.js';

export const name = 'mnm';
export const description = 'Put a user\'s avatar on an M&M.';
export const usage = 'mnm [@user]';
export const execute = memeCmd('mnm', 'https://api.popcat.xyz/mnm?image={avatar}', { title: 'M&M' });
