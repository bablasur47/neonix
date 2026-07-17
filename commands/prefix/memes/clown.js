import { memeCmd } from '../fun/_api.js';

export const name = 'clown';
export const description = 'Turn a user\'s avatar into a clown.';
export const usage = 'clown [@user]';
export const execute = memeCmd('clown', 'https://api.popcat.xyz/clown?image={avatar}');
