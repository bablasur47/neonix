import { memeCmd } from './_api.js';

export const name = 'wanted';
export const description = 'Put a user\'s avatar on a wanted poster.';
export const usage = 'wanted [@user]';
export const execute = memeCmd('wanted', 'https://api.popcat.xyz/wanted?image={avatar}');
