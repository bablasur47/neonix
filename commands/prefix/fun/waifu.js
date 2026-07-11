import { imageCmd } from './_api.js';

export const name = 'waifu';
export const description = 'Get a random waifu image.';
export const usage = 'waifu';
export const execute = imageCmd('waifu', 'nekosbest', 'https://nekos.best/api/v2/waifu');
