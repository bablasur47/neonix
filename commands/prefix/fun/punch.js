import { imageCmd } from './_api.js';

export const name = 'punch';
export const description = 'Get a random punch reaction GIF.';
export const usage = 'punch';
export const execute = imageCmd('punch', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=punch');
