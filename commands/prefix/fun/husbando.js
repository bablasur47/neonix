import { imageCmd } from './_api.js';

export const name = 'husbando';
export const description = 'Get a random husbando image.';
export const usage = 'husbando';
export const execute = imageCmd('husbando', 'nekosbest', 'https://nekos.best/api/v2/husbando');
