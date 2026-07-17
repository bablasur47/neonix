import { memeCmd } from '../fun/_api.js';

export const name = 'pikachu';
export const description = 'Surprised Pikachu meme with your text.';
export const usage = 'pikachu <text>';
export const execute = memeCmd('pikachu', 'https://api.popcat.xyz/pikachu?text={text}', { title: 'Surprised Pikachu' });
