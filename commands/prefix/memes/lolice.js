import { memeCmd } from '../fun/_api.js';

export const name = 'lolice';
export const description = 'Call the lolice on a user.';
export const usage = 'lolice [@user]';
export const execute = memeCmd('lolice', 'https://nekobot.xyz/api/imagegen?type=lolice&url={avatar}', { title: 'Lolice' });
