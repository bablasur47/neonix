import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'github';
export const description = 'Search GitHub or show a profile.';
export const usage = 'github <username> [repo]';
export const aliases = ['gh'];

export async function execute(message, args) {
  const query = args.join(' ');
  if (!query) {
    await reply(message, `${emojis.info} Usage: \`github <username>\` or \`github <user>/<repo>\``);
    return;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${query}`);
    if (res.ok) {
      const data = await res.json();
      await reply(message,
        `${emojis.info} **${data.full_name}**\n` +
        `${data.description || 'No description'}\n` +
        `⭐ ${data.stargazers_count}  🍴 ${data.forks_count}\n` +
        `🔗 ${data.html_url}`
      );
      return;
    }

    const res2 = await fetch(`https://api.github.com/users/${query}`);
    if (res2.ok) {
      const data = await res2.json();
      await reply(message,
        `${emojis.info} **${data.login}**\n` +
        `${data.bio || ''}\n` +
        `Repos: ${data.public_repos}  Followers: ${data.followers}\n` +
        `🔗 ${data.html_url}`
      );
      return;
    }

    await reply(message, `${emojis.error} Not found: \`${query}\``);
  } catch (err) {
    await reply(message, `${emojis.error} ${err.message}`);
  }
}
