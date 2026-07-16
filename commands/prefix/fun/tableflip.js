import { imageCmd } from './_api.js';

export const name = 'tableflip';
export const description = 'Get a random tableflip reaction GIF.';
export const usage = 'tableflip';
export const execute = imageCmd('tableflip', 'nekosbest', 'https://nekos.best/api/v2/tableflip');
