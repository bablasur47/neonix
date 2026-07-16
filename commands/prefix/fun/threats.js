import { memeCmd } from './_api.js';

export const name = 'threats';
export const aliases = ['threat'];
export const description = 'Mark a user as a threat to society.';
export const usage = 'threats [@user]';
export const execute = memeCmd('threats', 'https://nekobot.xyz/api/imagegen?type=threats&url={avatar}', { title: 'Threat to Society' });
