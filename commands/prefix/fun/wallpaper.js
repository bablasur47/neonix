import { imageCmd } from './_api.js';

export const name = 'wallpaper';
export const description = 'Get a random anime wallpaper.';
export const usage = 'wallpaper';
export const execute = imageCmd('wallpaper', 'nekosbest', 'https://nekos.best/api/v2/wallpaper');
