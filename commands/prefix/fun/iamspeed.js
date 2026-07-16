import { memeCmd } from './_api.js';

export const name = 'iamspeed';
export const aliases = ['speed'];
export const description = 'Put a user\'s avatar on the I Am Speed meme.';
export const usage = 'iamspeed [@user]';
export const execute = memeCmd('iamspeed', 'https://vacefron.nl/api/iamspeed?user={avatar}', { title: 'I Am Speed' });
