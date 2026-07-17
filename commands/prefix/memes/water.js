import { memeCmd } from '../fun/_api.js';

export const name = 'water';
export const description = 'Gordon Ramsay water meme with your text.';
export const usage = 'water <text>';
export const execute = memeCmd('water', 'https://vacefron.nl/api/water?text={text}');
