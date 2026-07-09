import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

const FLAGS = {
  ActiveDeveloper: '<:activedeveloper:>',
  BugHunterLevel1: '<:bughunter1:>',
  BugHunterLevel2: '<:bughunter2:>',
  CertifiedModerator: '<:discordmod:>',
  Partner: '<:partner:>',
  Staff: '<:staff:>',
  HypeSquadOnlineHouse1: '<:bravery:>',
  HypeSquadOnlineHouse2: '<:brilliance:>',
  HypeSquadOnlineHouse3: '<:balance:>',
  HypeSquadEvents: '<:hypesquad:>',
  EarlySupporter: '<:supporter:>',
  VerifiedBotDeveloper: '<:botdev:>',
};

export const name = 'badges';
export const description = 'Show a user\'s Discord badges.';
export const usage = 'badges [@user]';

export async function execute(message, args) {
  const user = message.mentions.users.first()
    || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null)
    || message.author;

  const flags = user.flags?.toArray() || [];
  const badges = flags.map(f => FLAGS[f] || f).join(' ') || 'None';

  await reply(message, `${emojis.info} **${user.tag}** badges:\n${badges}`);
}
