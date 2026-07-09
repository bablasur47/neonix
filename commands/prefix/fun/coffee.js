import { imageCmd } from './_api.js';

export const name = 'coffee';
export const description = 'Get a random coffee image.';
export const usage = 'coffee';
export const execute = imageCmd('coffee', 'nekobot', 'https://nekobot.xyz/api/image?type=coffee');
