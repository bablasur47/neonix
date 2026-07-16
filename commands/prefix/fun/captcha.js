import { memeCmd } from './_api.js';

export const name = 'captcha';
export const description = 'Turn a user into a captcha challenge.';
export const usage = 'captcha [@user]';
export const execute = memeCmd('captcha', 'https://nekobot.xyz/api/imagegen?type=captcha&url={avatar}&username={username}');
