import { memeCmd } from '../fun/_api.js';

export const name = 'emergencymeeting';
export const aliases = ['emergency'];
export const description = 'Among Us emergency meeting meme with your text.';
export const usage = 'emergencymeeting <text>';
export const execute = memeCmd('emergencymeeting', 'https://vacefron.nl/api/emergencymeeting?text={text}', { title: 'Emergency Meeting' });
