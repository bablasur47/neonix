import { memeCmd } from '../fun/_api.js';

export const name = 'tweet';
export const description = 'Fake tweet from a user.';
export const usage = 'tweet [@user] <text>';
export const execute = memeCmd('tweet', 'https://nekobot.xyz/api/imagegen?type=tweet&username={username}&text={text}', { usage: 'tweet [@user] <text>' });
