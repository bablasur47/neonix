import { imageCmd } from './_api.js';

export const name = 'highfive';
export const description = 'Get a random highfive reaction GIF.';
export const usage = 'highfive';
export const execute = imageCmd('highfive', 'nekosbest', 'https://nekos.best/api/v2/highfive');
