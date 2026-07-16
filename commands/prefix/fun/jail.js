import { memeCmd } from './_api.js';

export const name = 'jail';
export const description = 'Put a user\'s avatar behind bars.';
export const usage = 'jail [@user]';
export const execute = memeCmd('jail', 'https://api.popcat.xyz/jail?image={avatar}');
