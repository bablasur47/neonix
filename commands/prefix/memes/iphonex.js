import { memeCmd } from '../fun/_api.js';

export const name = 'iphonex';
export const aliases = ['iphone'];
export const description = 'Put a user\'s avatar on an iPhone X.';
export const usage = 'iphonex [@user]';
export const execute = memeCmd('iphonex', 'https://nekobot.xyz/api/imagegen?type=iphonex&url={avatar}', { title: 'iPhone X' });
