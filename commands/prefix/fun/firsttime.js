import { memeCmd } from './_api.js';

export const name = 'firsttime';
export const description = 'Put a user\'s avatar on the First Time meme.';
export const usage = 'firsttime [@user]';
export const execute = memeCmd('firsttime', 'https://vacefron.nl/api/firsttime?user={avatar}', { title: 'First Time?' });
