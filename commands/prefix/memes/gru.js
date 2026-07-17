import { memeCmd } from '../fun/_api.js';

export const name = 'gru';
export const aliases = ['gruplan'];
export const description = 'Gru\'s master plan meme.';
export const usage = 'gru <step 1> | <step 2>';
export const execute = memeCmd('gru', 'https://api.memegen.link/images/gru/{text1}/{text2}.png', { memegen: true, title: 'Gru\'s Plan', usage: 'gru <step 1> | <step 2>' });
