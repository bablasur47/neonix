import { memeCmd } from './_api.js';

export const name = 'drip';
export const description = 'Give a user\'s avatar the drip.';
export const usage = 'drip [@user]';
export const execute = memeCmd('drip', 'https://api.popcat.xyz/drip?image={avatar}');
