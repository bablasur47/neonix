import { imageCmd } from './_api.js';

export const name = 'yeet';
export const description = 'Get a random yeet reaction GIF.';
export const usage = 'yeet';
export const execute = imageCmd('yeet', 'nekosbest', 'https://nekos.best/api/v2/yeet');
