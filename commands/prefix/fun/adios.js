import { memeCmd } from './_api.js';

export const name = 'adios';
export const description = 'Adios! Wave goodbye.';
export const usage = 'adios [@user]';
export const execute = memeCmd('adios', 'https://vacefron.nl/api/adios?user={avatar}', { title: 'Adios' });
