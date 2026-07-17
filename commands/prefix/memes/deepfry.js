import { memeCmd } from '../fun/_api.js';

export const name = 'deepfry';
export const description = 'Deepfry a user\'s avatar.';
export const usage = 'deepfry [@user]';
export const execute = memeCmd('deepfry', 'https://nekobot.xyz/api/imagegen?type=deepfry&image={avatar}', { title: 'Deep Fried' });
