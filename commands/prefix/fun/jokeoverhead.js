import { memeCmd } from './_api.js';

export const name = 'jokeoverhead';
export const description = 'The joke went over a user\'s head.';
export const usage = 'jokeoverhead [@user]';
export const execute = memeCmd('jokeoverhead', 'https://api.popcat.xyz/jokeoverhead?image={avatar}', { title: 'Joke Over Head' });
