import { memeCmd } from '../fun/_api.js';

export const name = 'pet';
export const aliases = ['petpet'];
export const description = 'Pet a user\'s avatar.';
export const usage = 'pet [@user]';
export const execute = memeCmd('pet', 'https://api.popcat.xyz/pet?image={avatar}', { title: 'Pet Pet' });
