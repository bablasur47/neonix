import { memeCmd } from './_api.js';

export const name = 'oogway';
export const description = 'Master Oogway shares your wisdom.';
export const usage = 'oogway <text>';
export const execute = memeCmd('oogway', 'https://api.popcat.xyz/oogway?text={text}', { title: 'Master Oogway' });
