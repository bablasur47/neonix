import { memeCmd } from '../fun/_api.js';

export const name = 'magik';
export const aliases = ['magic'];
export const description = 'Distort a user\'s avatar.';
export const usage = 'magik [@user]';
export const execute = memeCmd('magik', 'https://nekobot.xyz/api/imagegen?type=magik&image={avatar}', { title: 'Magik' });
