import { memeCmd } from '../fun/_api.js';

export const name = 'invert';
export const description = 'Invert the colors of a user\'s avatar.';
export const usage = 'invert [@user]';
export const execute = memeCmd('invert', 'https://api.popcat.xyz/invert?image={avatar}');
