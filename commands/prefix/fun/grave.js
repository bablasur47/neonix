import { memeCmd } from './_api.js';

export const name = 'grave';
export const aliases = ['rip'];
export const description = 'Put a user\'s avatar on a gravestone.';
export const usage = 'grave [@user]';
export const execute = memeCmd('grave', 'https://vacefron.nl/api/grave?user={avatar}', { title: 'RIP' });
