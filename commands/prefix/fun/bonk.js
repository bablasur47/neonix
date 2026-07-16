import { imageCmd } from './_api.js';

export const name = 'bonk';
export const description = 'Get a random bonk reaction GIF.';
export const usage = 'bonk';
export const execute = imageCmd('bonk', 'nekosbest', 'https://nekos.best/api/v2/bonk');
