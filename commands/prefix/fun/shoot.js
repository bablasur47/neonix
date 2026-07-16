import { imageCmd } from './_api.js';

export const name = 'shoot';
export const description = 'Get a random shoot reaction GIF.';
export const usage = 'shoot';
export const execute = imageCmd('shoot', 'nekosbest', 'https://nekos.best/api/v2/shoot');
