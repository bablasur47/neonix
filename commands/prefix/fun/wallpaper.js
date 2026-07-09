import { imageCmd } from './_api.js';

export const name = 'wallpaper';
export const description = 'Get a random anime wallpaper.';
export const usage = 'wallpaper';
export const execute = imageCmd('wallpaper', 'nekoslife', 'https://nekos.life/api/v2/img/wallpaper');
