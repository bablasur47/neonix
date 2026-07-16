import { memeCmd } from './_api.js';

export const name = 'npc';
export const description = 'NPC meme with two lines of text.';
export const usage = 'npc <text 1> | <text 2>';
export const execute = memeCmd('npc', 'https://vacefron.nl/api/npc?text1={text1}&text2={text2}', { title: 'NPC' });
