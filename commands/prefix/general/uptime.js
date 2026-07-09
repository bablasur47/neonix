import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'uptime';
export const description = 'Show bot uptime.';
export const usage = 'uptime';

export async function execute(message) {
  const uptime = process.uptime();
  const d = Math.floor(uptime / 86400);
  const h = Math.floor((uptime % 86400) / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);

  await reply(message, 
    `${emojis.info} Uptime: **${d}d ${h}h ${m}m ${s}s**`
  );
}
