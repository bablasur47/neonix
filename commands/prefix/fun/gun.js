import { memeCmd } from './_api.js';

export const name = 'gun';
export const description = 'Add a gun overlay to a user\'s avatar.';
export const usage = 'gun [@user]';
export const execute = memeCmd('gun', 'https://api.popcat.xyz/gun?image={avatar}');
