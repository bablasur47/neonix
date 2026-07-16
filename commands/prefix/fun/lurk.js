import { imageCmd } from './_api.js';

export const name = 'lurk';
export const description = 'Get a random lurk reaction GIF.';
export const usage = 'lurk';
export const execute = imageCmd('lurk', 'nekosbest', 'https://nekos.best/api/v2/lurk');
