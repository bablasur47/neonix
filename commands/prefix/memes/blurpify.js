import { memeCmd } from '../fun/_api.js';

export const name = 'blurpify';
export const aliases = ['blurple'];
export const description = 'Blurpify a user\'s avatar.';
export const usage = 'blurpify [@user]';
export const execute = memeCmd('blurpify', 'https://nekobot.xyz/api/imagegen?type=blurpify&image={avatar}', { title: 'Blurpify' });
