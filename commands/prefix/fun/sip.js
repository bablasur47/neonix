import { imageCmd } from './_api.js';

export const name = 'sip';
export const description = 'Get a random sip reaction GIF.';
export const usage = 'sip';
export const execute = imageCmd('sip', 'otaku', 'https://api.otakugifs.xyz/gif?reaction=sip');
