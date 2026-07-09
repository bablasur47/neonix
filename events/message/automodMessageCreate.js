import { Events } from 'discord.js';
import { getDb } from '../../database/index.js';

export const name = Events.MessageCreate;

// Regex patterns
const DISCORD_INVITE_REGEX = /(discord\.gg|discord\.com\/invite)\/[a-zA-Z0-9-]+/gi;
const LINK_REGEX = /https?:\/\/([^\s/$.?#].[^\s]*)/gi;

// Default whitelisted domains for links
const DEFAULT_LINK_WHITELIST = ['tenor.com', 'giphy.com', 'imgur.com', 'media.discordapp.net', 'cdn.discordapp.com'];

// Custom warning messages for each rule type
const CUSTOM_MESSAGES = {
  keyword: `${process.env.EMOJI_ERROR || '❌'} {user}, that language isn't allowed here! Watch your words.`,
  spam: `${process.env.EMOJI_ERROR || '❌'} {user}, stop spamming! Keep it clean.`,
  mention: `${process.env.EMOJI_ERROR || '❌'} {user}, too many mentions! Calm down.`,
  link: `${process.env.EMOJI_ERROR || '❌'} {user}, links aren't allowed in this server.`,
  invite: `${process.env.EMOJI_ERROR || '❌'} {user}, Discord invites aren't permitted here.`,
};

export async function execute(message) {
  try {
    if (!message.guild || message.author.bot || message.system || !message.member) {
      return;
    }

    // Skip if no permissions to delete
    if (!message.channel.permissionsFor(message.guild.members.me).has('DeleteMessages')) {
      return;
    }

    const db = getDb('automod');
    const guildId = message.guild.id;
    const memberId = message.member.id;

    // Check if member is directly whitelisted (global)
    const userWhitelisted = db.query('SELECT * FROM automod_whitelist WHERE guild_id = ? AND target_id = ? AND type = ?').all(guildId, memberId, 'user');
    if (userWhitelisted.length > 0) {
      return;
    }

    // Check if user has any whitelisted roles (global)
    const whitelistRoles = db.query('SELECT target_id FROM automod_whitelist WHERE guild_id = ? AND type = ?').all(guildId, 'role');
    for (const role of whitelistRoles) {
      if (message.member.roles.cache.has(role.target_id)) {
        return;
      }
    }

    const content = message.content.toLowerCase();
    let violation = false;
    let violationType = '';
    let customMessage = '';

    // Check keyword filter
    if (!violation) {
      const keywords = db.query('SELECT id, content, custom_message FROM automod_rules WHERE guild_id = ? AND rule_type = ? AND enabled = 1').all(guildId, 'keyword');
      for (const kw of keywords) {
        // Check rule exception (role/user bypass for this rule)
        if (isRuleException(db, guildId, 'keyword', memberId, message.member.roles.cache)) {
          continue;
        }

        const words = JSON.parse(kw.content);
        for (const word of words) {
          if (content.includes(word.toLowerCase())) {
            violation = true;
            violationType = 'keyword';
            customMessage = kw.custom_message || CUSTOM_MESSAGES.keyword;
            break;
          }
        }
        if (violation) break;
      }
    }

    // Check spam
    if (!violation) {
      const spamRules = db.query('SELECT id, custom_message FROM automod_rules WHERE guild_id = ? AND rule_type = ? AND enabled = 1').all(guildId, 'spam');
      if (spamRules.length > 0) {
        // Check rule exception
        if (!isRuleException(db, guildId, 'spam', memberId, message.member.roles.cache)) {
          if (/(.)\1{4,}/.test(content)) {
            violation = true;
            violationType = 'spam';
            customMessage = spamRules[0].custom_message || CUSTOM_MESSAGES.spam;
          }
        }
      }
    }

    // Check mention spam
    if (!violation) {
      const mentionRules = db.query('SELECT id, content, custom_message FROM automod_rules WHERE guild_id = ? AND rule_type = ? AND enabled = 1').all(guildId, 'mention');
      if (mentionRules.length > 0 && mentionRules[0].content) {
        // Check rule exception
        if (!isRuleException(db, guildId, 'mention', memberId, message.member.roles.cache)) {
          const limit = parseInt(mentionRules[0].content);
          if (message.mentions.size > limit) {
            violation = true;
            violationType = 'mention';
            customMessage = mentionRules[0].custom_message || CUSTOM_MESSAGES.mention;
          }
        }
      }
    }

    // Check link filter
    if (!violation) {
      const linkRules = db.query('SELECT id, custom_message FROM automod_rules WHERE guild_id = ? AND rule_type = ? AND enabled = 1').all(guildId, 'link');
      if (linkRules.length > 0) {
        // Check if user has link bypass role
        const bypassRoles = db.query('SELECT role_id FROM automod_link_bypass_roles WHERE guild_id = ?').all(guildId);
        let hasLinkBypass = false;
        for (const role of bypassRoles) {
          if (message.member.roles.cache.has(role.role_id)) {
            hasLinkBypass = true;
            break;
          }
        }

        if (!hasLinkBypass) {
          // Check rule exception
          if (!isRuleException(db, guildId, 'link', memberId, message.member.roles.cache)) {
            const linkMatch = content.match(LINK_REGEX);
            if (linkMatch) {
              // Check if link is whitelisted
              let isWhitelisted = false;
              const whitelistedLinks = db.query('SELECT domain FROM automod_link_whitelist WHERE guild_id = ?').all(guildId);
              
              for (const link of linkMatch) {
                const domain = extractDomain(link);
                const isDefaultWhitelisted = DEFAULT_LINK_WHITELIST.some(d => domain.includes(d));
                const isCustomWhitelisted = whitelistedLinks.some(w => domain.includes(w.domain));
                
                if (!isDefaultWhitelisted && !isCustomWhitelisted) {
                  violation = true;
                  violationType = 'link';
                  customMessage = linkRules[0].custom_message || CUSTOM_MESSAGES.link;
                  break;
                }
              }
            }
          }
        }
      }
    }

    // Check discord invite filter
    if (!violation) {
      const inviteRules = db.query('SELECT id, custom_message FROM automod_rules WHERE guild_id = ? AND rule_type = ? AND enabled = 1').all(guildId, 'invite');
      if (inviteRules.length > 0) {
        // Check rule exception
        if (!isRuleException(db, guildId, 'invite', memberId, message.member.roles.cache)) {
          if (DISCORD_INVITE_REGEX.test(content)) {
            violation = true;
            violationType = 'invite';
            customMessage = inviteRules[0].custom_message || CUSTOM_MESSAGES.invite;
          }
        }
      }
    }

    // If violation detected
    if (violation) {
      try {
        await message.delete();
        const displayMessage = customMessage.replace('{user}', message.author.toString());
        const warningMsg = await message.channel.send({
          content: displayMessage,
        });

        // Delete warning after 5 seconds
        setTimeout(() => {
          warningMsg.delete().catch(() => {});
        }, 5000);
      } catch (err) {
        // Silent error handling
      }
    }
  } catch (err) {
    // Silent error handling
  }
}

/**
 * Check if a user/role has an exception for a specific rule
 */
function isRuleException(db, guildId, ruleType, memberId, memberRoles) {
  // Check user exception
  const userException = db.query('SELECT * FROM automod_rule_exceptions WHERE guild_id = ? AND rule_type = ? AND target_id = ? AND type = ?').all(guildId, ruleType, memberId, 'user');
  if (userException.length > 0) {
    return true;
  }

   // Check role exceptions
   const roleExceptions = db.query('SELECT target_id FROM automod_rule_exceptions WHERE guild_id = ? AND rule_type = ? AND type = ?').all(guildId, ruleType, 'role');
   for (const role of roleExceptions) {
     if (memberRoles.has(role.target_id)) {
       return true;
     }
   }

  return false;
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}
