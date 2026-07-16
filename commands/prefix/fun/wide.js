import { memeCmd } from './_api.js';

export const name = 'wide';
export const description = 'Make a user\'s avatar wide.';
export const usage = 'wide [@user]';
export const execute = memeCmd('wide', 'https://api.popcat.xyz/wide?image={avatar}');
