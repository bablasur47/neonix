import { imageCmd } from './_api.js';

export const name = 'fox';
export const description = 'Get a random fox image.';
export const usage = 'fox';
export const execute = imageCmd('fox', 'fox', 'https://randomfox.ca/floof/');
