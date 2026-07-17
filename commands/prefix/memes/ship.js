import { memeCmd } from '../fun/_api.js';

export const name = 'ship';
export const description = 'Ship two users together.';
export const usage = 'ship @user [@user]';
export const execute = memeCmd('ship', 'https://nekobot.xyz/api/imagegen?type=ship&user1={avatar}&user2={avatar2}');
