import { memeCmd } from './_api.js';

export const name = 'greyscale';
export const aliases = ['grayscale'];
export const description = 'Make a user\'s avatar greyscale.';
export const usage = 'greyscale [@user]';
export const execute = memeCmd('greyscale', 'https://api.popcat.xyz/greyscale?image={avatar}');
