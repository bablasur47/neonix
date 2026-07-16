import { memeCmd } from './_api.js';

export const name = 'heaven';
export const description = 'Send a user\'s avatar to heaven.';
export const usage = 'heaven [@user]';
export const execute = memeCmd('heaven', 'https://vacefron.nl/api/heaven?user={avatar}');
