import { memeCmd } from '../fun/_api.js';

export const name = 'carreverse';
export const aliases = ['reverse'];
export const description = 'Car reversing out of a situation.';
export const usage = 'carreverse <text>';
export const execute = memeCmd('carreverse', 'https://vacefron.nl/api/carreverse?text={text}', { title: 'Car Reverse' });
