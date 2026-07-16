import { memeCmd } from './_api.js';

export const name = 'ejected';
export const aliases = ['eject'];
export const description = 'Eject a user, Among Us style.';
export const usage = 'ejected [@user]';
export const execute = memeCmd('ejected', 'https://vacefron.nl/api/ejected?name={username}&impostor=true&crewmate=red', { title: 'Ejected' });
