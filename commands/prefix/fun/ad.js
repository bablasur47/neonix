import { memeCmd } from './_api.js';

export const name = 'ad';
export const description = 'Put a user\'s avatar on an advertisement.';
export const usage = 'ad [@user]';
export const execute = memeCmd('ad', 'https://api.popcat.xyz/ad?image={avatar}', { title: 'Advertisement' });
