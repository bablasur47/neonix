import { imageCmd } from './_api.js';

export const name = 'neko';
export const description = 'Get a random neko anime image.';
export const usage = 'neko';
export const execute = imageCmd('neko', 'nekosbest', 'https://nekos.best/api/v2/neko');
