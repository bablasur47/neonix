import { memeCmd } from './_api.js';

export const name = 'thisisfine';
export const aliases = ['fine'];
export const description = 'This is fine.';
export const usage = 'thisisfine <text>';
export const execute = memeCmd('thisisfine', 'https://api.memegen.link/images/fine/_/{text}.png', { memegen: true, title: 'This Is Fine' });
