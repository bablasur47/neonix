import { memeCmd } from '../fun/_api.js';

export const name = 'trash';
export const description = 'Put a user\'s avatar in the trash.';
export const usage = 'trash [@user]';
export const execute = memeCmd('trash', 'https://nekobot.xyz/api/imagegen?type=trash&url={avatar}', { title: 'Trash' });
