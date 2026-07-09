import { imageCmd } from './_api.js';

export const name = 'waifu';
export const description = 'Get a random waifu image.';
export const usage = 'waifu';
export const execute = imageCmd('waifu', 'nekoslife', 'https://nekos.life/api/v2/img/waifu');
