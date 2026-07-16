import { imageCmd } from './_api.js';

export const name = 'angry';
export const description = 'Get a random angry reaction GIF.';
export const usage = 'angry';
export const execute = imageCmd('angry', 'nekosbest', 'https://nekos.best/api/v2/angry');
