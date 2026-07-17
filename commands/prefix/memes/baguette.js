import { memeCmd } from '../fun/_api.js';

export const name = 'baguette';
export const description = 'Someone\'s eating a baguette.';
export const usage = 'baguette [@user]';
export const execute = memeCmd('baguette', 'https://nekobot.xyz/api/imagegen?type=baguette&url={avatar}', { title: 'Baguette' });
