import { memeCmd } from '../fun/_api.js';

export const name = 'communism';
export const description = 'Apply a communism filter to a user\'s avatar.';
export const usage = 'communism [@user]';
export const execute = memeCmd('communism', 'https://api.popcat.xyz/communism?image={avatar}');
