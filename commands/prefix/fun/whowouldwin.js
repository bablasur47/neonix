import { memeCmd } from './_api.js';

export const name = 'whowouldwin';
export const aliases = ['www'];
export const description = 'Who would win between two users?';
export const usage = 'whowouldwin @user [@user]';
export const execute = memeCmd('whowouldwin', 'https://nekobot.xyz/api/imagegen?type=whowouldwin&user1={avatar}&user2={avatar2}', { title: 'Who Would Win?' });
