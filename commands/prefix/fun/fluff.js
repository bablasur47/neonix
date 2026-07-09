import { imageCmd } from './_api.js';

export const name = 'fluff';
export const description = 'Get a random fluff anime image.';
export const usage = 'fluff';
export const execute = imageCmd('fluff', 'purrbot', 'https://purrbot.site/api/img/sfw/fluff/gif');
