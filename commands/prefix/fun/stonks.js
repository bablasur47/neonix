import { memeCmd } from './_api.js';

export const name = 'stonks';
export const description = 'Put a user\'s avatar on the stonks meme.';
export const usage = 'stonks [@user]';
export const execute = memeCmd('stonks', 'https://vacefron.nl/api/stonks?user={avatar}');
