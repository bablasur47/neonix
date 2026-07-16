import { memeCmd } from './_api.js';

export const name = 'wolverine';
export const description = 'Put a user\'s avatar in the Wolverine frame meme.';
export const usage = 'wolverine [@user]';
export const execute = memeCmd('wolverine', 'https://vacefron.nl/api/wolverine?user={avatar}');
