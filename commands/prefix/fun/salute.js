import { imageCmd } from './_api.js';

export const name = 'salute';
export const description = 'Get a random salute reaction GIF.';
export const usage = 'salute';
export const execute = imageCmd('salute', 'nekosbest', 'https://nekos.best/api/v2/salute');
