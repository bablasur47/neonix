import { imageCmd } from './_api.js';

export const name = 'icon';
export const description = 'Get a random icon anime image.';
export const usage = 'icon';
export const execute = imageCmd('icon', 'purrbot', 'https://purrbot.site/api/img/sfw/icon/img');
