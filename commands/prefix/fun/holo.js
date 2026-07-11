import { imageCmd } from './_api.js';

export const name = 'holo';
export const description = 'Get a random holo image.';
export const usage = 'holo';
export const execute = imageCmd('holo', 'nekobot', 'https://nekobot.xyz/api/image?type=holo');
