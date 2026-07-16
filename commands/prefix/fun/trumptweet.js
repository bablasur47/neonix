import { memeCmd } from './_api.js';

export const name = 'trumptweet';
export const aliases = ['trump'];
export const description = 'Trump tweets your text.';
export const usage = 'trumptweet <text>';
export const execute = memeCmd('trumptweet', 'https://nekobot.xyz/api/imagegen?type=trumptweet&text={text}', { title: 'Trump Tweet' });
