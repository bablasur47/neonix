import { memeCmd } from '../fun/_api.js';

export const name = 'distractedbf';
export const aliases = ['distracted'];
export const description = 'Distracted boyfriend meme with avatars.';
export const usage = 'distractedbf @user [@user]';
export const execute = memeCmd('distractedbf', 'https://vacefron.nl/api/distractedbf?boyfriend={avatar}&girlfriend={avatar}&woman={avatar2}', { title: 'Distracted Boyfriend', usage: 'distractedbf @user [@user]' });
