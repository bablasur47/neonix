import { memeCmd } from './_api.js';

export const name = 'dockofshame';
export const aliases = ['shame'];
export const description = 'Walk the dock of shame.';
export const usage = 'dockofshame [@user]';
export const execute = memeCmd('dockofshame', 'https://vacefron.nl/api/dockofshame?user={avatar}', { title: 'Dock of Shame' });
