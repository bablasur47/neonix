import { memeCmd } from './_api.js';

export const name = 'clyde';
export const description = 'Make Clyde say something.';
export const usage = 'clyde <text>';
export const execute = memeCmd('clyde', 'https://nekobot.xyz/api/imagegen?type=clyde&text={text}', { title: 'Clyde' });
