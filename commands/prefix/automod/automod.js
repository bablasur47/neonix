import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { isAdmin } from '../../../util/permissions.js';
import { handleRule } from './rule.js';
import { handleWhitelist } from './whitelist.js';
import { handleLink } from './link.js';

export const name = 'automod';
export const aliases = ['am'];
export const description = 'Manage AutoMod rules and whitelist.';
export const usage = 'automod [subcommand] [args]';

export async function execute(message, args) {
  try {
    if (!isAdmin(message.member)) {
      await reply(message, `${emojis.error} Only admins can manage AutoMod.`);
      return;
    }

    const sub = args[0]?.toLowerCase();

    if (sub === 'rule') {
      await handleRule(message, args.slice(1));
      return;
    }

    if (sub === 'whitelist') {
      await handleWhitelist(message, args.slice(1));
      return;
    }

    if (sub === 'link') {
      await handleLink(message, args.slice(1));
      return;
    }

    // Show overview
    try {
      const db = getDb('automod');
      const rules = db.query('SELECT rule_type, COUNT(*) as count FROM automod_rules WHERE guild_id = ? AND enabled = 1 GROUP BY rule_type').all(message.guild.id);
      const whitelist = db.query('SELECT target_id, type FROM automod_whitelist WHERE guild_id = ?').all(message.guild.id);
      const linkWhitelist = db.query('SELECT COUNT(*) as count FROM automod_link_whitelist WHERE guild_id = ?').all(message.guild.id);
      const linkBypass = db.query('SELECT COUNT(*) as count FROM automod_link_bypass_roles WHERE guild_id = ?').all(message.guild.id);

      const ruleStats = rules.reduce((acc, r) => {
        acc[r.rule_type] = r.count;
        return acc;
      }, {});

      const overview = [
        `${emojis.info} **AutoMod Configuration**`,
        ``,
        `**Active Rules:**`,
        `  • Keywords: ${ruleStats.keyword || 0}`,
        `  • Spam: ${ruleStats.spam || 0}`,
        `  • Mentions: ${ruleStats.mention || 0}`,
        `  • Links: ${ruleStats.link || 0}`,
        `  • Discord Invites: ${ruleStats.invite || 0}`,
        ``,
        `**Other Settings:**`,
        `  • Whitelisted entries: ${whitelist.length}`,
        `  • Whitelisted domains: ${linkWhitelist[0].count}`,
        `  • Link bypass roles: ${linkBypass[0].count}`,
        ``,
        `**Main Commands:**`,
        `\`automod rule [subcommand]\` — Manage rules`,
        `\`automod whitelist [subcommand]\` — Global user/role whitelist`,
        `\`automod link [subcommand]\` — Link filter settings`,
        ``,
        `**Type \`automod help\` for detailed help**`,
      ].join('\n');

      await reply(message, overview);
    } catch (err) {
      await reply(message, `${emojis.error} Failed to load AutoMod overview.`);
    }
  } catch (err) {
    await reply(message, `${emojis.error} An unexpected error occurred.`);
  }
}
