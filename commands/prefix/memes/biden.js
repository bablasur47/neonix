import { memeCmd } from '../fun/_api.js';

export const name = 'biden';
export const description = 'Biden tweets your text.';
export const usage = 'biden <text>';
export const execute = memeCmd('biden', 'https://api.popcat.xyz/biden?text={text}', { title: 'Biden Tweet' });
