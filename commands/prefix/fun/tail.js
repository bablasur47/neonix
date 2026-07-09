import { imageCmd } from './_api.js';

export const name = 'tail';
export const description = 'Get a random tail anime image.';
export const usage = 'tail';
export const execute = imageCmd('tail', 'purrbot', 'https://purrbot.site/api/img/sfw/tail/gif');
