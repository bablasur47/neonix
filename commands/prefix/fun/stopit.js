import { memeCmd } from './_api.js';

export const name = 'stopit';
export const description = 'Stop it, get some help.';
export const usage = 'stopit <text>';
export const execute = memeCmd('stopit', 'https://api.memegen.link/images/stop/_/{text}.png', { memegen: true, title: 'Stop It, Get Some Help' });
