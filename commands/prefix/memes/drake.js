import { memeCmd } from '../fun/_api.js';

export const name = 'drake';
export const description = 'Drake meme: rejects text 1, approves text 2.';
export const usage = 'drake <text 1> | <text 2>';
export const execute = memeCmd('drake', 'https://api.memegen.link/images/drake/{text1}/{text2}.png', { memegen: true });
