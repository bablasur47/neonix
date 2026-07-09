import { imageCmd } from './_api.js';

export const name = 'feed';
export const description = 'Get a random feed anime image.';
export const usage = 'feed';
export const execute = imageCmd('feed', 'purrbot', 'https://purrbot.site/api/img/sfw/feed/gif');
