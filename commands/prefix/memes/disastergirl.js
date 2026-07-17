import { memeCmd } from '../fun/_api.js';

export const name = 'disastergirl';
export const description = 'Disaster girl meme with your text.';
export const usage = 'disastergirl <text>';
export const execute = memeCmd('disastergirl', 'https://api.memegen.link/images/disastergirl/_/{text}.png', { memegen: true, title: 'Disaster Girl' });
