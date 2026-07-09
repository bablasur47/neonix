import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'checkvanity';
export const description = 'Check if a vanity URL is available.';
export const usage = 'checkvanity <code>';
export const aliases = ['vanity'];

export async function execute(message, args) {
  const code = args[0];
  if (!code) {
    await reply(message, `${emojis.warning} Usage: \`checkvanity <code>\``);
    return;
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`);
    if (res.ok) {
      const data = await res.json();
      await reply(message, `${emojis.warning} Vanity \`${code}\` is **taken** — server: ${data.guild?.name || 'Unknown'}`);
    } else if (res.status === 404) {
      await reply(message, `${emojis.success} Vanity \`${code}\` is **available**!`);
    } else {
      const body = await res.text();
      await reply(message, `${emojis.error} API error (${res.status}): ${body.slice(0, 200)}`);
    }
  } catch (err) {
    await reply(message, `${emojis.error} ${err.message}`);
  }
}
