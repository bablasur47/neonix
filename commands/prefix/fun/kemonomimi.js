import { imageCmd } from './_api.js';

export const name = 'kemonomimi';
export const description = 'Get a random kemonomimi image.';
export const usage = 'kemonomimi';
export const execute = imageCmd('kemonomimi', 'waifupics', 'https://api.waifu.pics/sfw/kemonomimi');
