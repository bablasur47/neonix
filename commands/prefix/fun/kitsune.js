import { imageCmd } from './_api.js';

export const name = 'kitsune';
export const description = 'Get a random kitsune image.';
export const usage = 'kitsune';
export const execute = imageCmd('kitsune', 'nekosbest', 'https://nekos.best/api/v2/kitsune');
