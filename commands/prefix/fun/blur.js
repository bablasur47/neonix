import { memeCmd } from './_api.js';

export const name = 'blur';
export const description = 'Blur a user\'s avatar.';
export const usage = 'blur [@user]';
export const execute = memeCmd('blur', 'https://api.popcat.xyz/blur?image={avatar}');
