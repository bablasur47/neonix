import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export async function handleRule(message, args) {
  try {
    const sub = args[0]?.toLowerCase();

    if (sub === 'list') {
      await handleRuleList(message);
      return;
    }

    if (sub === 'add') {
      await handleRuleAdd(message, args.slice(1));
      return;
    }

    if (sub === 'remove' || sub === 'delete') {
      await handleRuleRemove(message, args.slice(1));
      return;
    }

    if (sub === 'toggle') {
      await handleRuleToggle(message, args.slice(1));
      return;
    }

    if (sub === 'message' || sub === 'msg') {
      await handleRuleMessage(message, args.slice(1));
      return;
    }

    if (sub === 'exception') {
      await handleRuleException(message, args.slice(1));
      return;
    }

    await reply(message, `${emojis.warning} Usage: \`automod rule list/add/remove/toggle/message/exception\``);
  } catch (err) {
    await reply(message, `${emojis.error} An unexpected error occurred.`);
  }
}

async function handleRuleList(message) {
  try {
    const db = getDb('automod');
    const rules = db.query('SELECT id, rule_type, rule_name, content, enabled, custom_message FROM automod_rules WHERE guild_id = ? ORDER BY rule_type').all(message.guild.id);

    if (!rules.length) {
      await reply(message, `${emojis.info} No AutoMod rules configured.`);
      return;
    }

    const grouped = {};
    for (const rule of rules) {
      if (!grouped[rule.rule_type]) {
        grouped[rule.rule_type] = [];
      }
      grouped[rule.rule_type].push(rule);
    }

    let output = `${emojis.info} **AutoMod Rules:**\n\n`;
    for (const [type, typeRules] of Object.entries(grouped)) {
      output += `**${type.toUpperCase()}**\n`;
      for (const rule of typeRules) {
        const status = rule.enabled ? '✅' : '❌';
        let content = rule.content;
        if (type === 'keyword') {
          content = JSON.parse(content).join(', ');
        } else if (type === 'mention') {
          content = `Limit: ${content}`;
        }
        const msg = rule.custom_message ? ` | Custom msg: "${rule.custom_message.substring(0, 30)}..."` : '';
        output += `  ${status} \`${rule.id}\` — ${rule.rule_name} (${content})${msg}\n`;
      }
      output += '\n';
    }

    await reply(message, output.slice(0, 1900));
  } catch (err) {
    await reply(message, `${emojis.error} Failed to list rules: ${err.message}`);
  }
}

async function handleRuleAdd(message, args) {
  try {
    const type = args[0]?.toLowerCase();
    const rest = args.slice(1).join(' ');
    const db = getDb('automod');
    const guildId = message.guild.id;

    if (type === 'keyword') {
      if (!rest) {
        await reply(message, `${emojis.warning} Usage: \`automod rule add keyword <word1, word2, ...>\``);
        return;
      }
      const words = rest.split(',').map(w => w.trim()).filter(Boolean);
      if (words.length < 1) {
        await reply(message, `${emojis.warning} Provide at least one keyword.`);
        return;
      }

      try {
        const existing = db.query('SELECT id FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, 'keyword');
        
        if (existing.length > 0) {
          const existingWords = JSON.parse(db.query('SELECT content FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, 'keyword')[0].content);
          const allWords = [...new Set([...existingWords, ...words])];
          db.run('UPDATE automod_rules SET content = ? WHERE guild_id = ? AND rule_type = ?', [JSON.stringify(allWords), guildId, 'keyword']);
          await reply(message, `${emojis.success} Updated keyword filter. Added ${words.length} new words. Total: ${allWords.length}`);
        } else {
          db.run('INSERT INTO automod_rules (guild_id, rule_type, rule_name, content, enabled) VALUES (?, ?, ?, ?, ?)',
            [guildId, 'keyword', `Keyword Filter (${words.length} words)`, JSON.stringify(words), 1]);
          await reply(message, `${emojis.success} Keyword filter created with ${words.length} words.`);
        }
      } catch (err) {
        await reply(message, `${emojis.error} Failed to add keywords: ${err.message}`);
      }
      return;
    }

    if (type === 'spam') {
      try {
        const existing = db.query('SELECT id FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, 'spam');
        
        if (existing.length > 0) {
          await reply(message, `${emojis.warning} Spam protection already enabled.`);
          return;
        }

        db.run('INSERT INTO automod_rules (guild_id, rule_type, rule_name, content, enabled) VALUES (?, ?, ?, ?, ?)',
          [guildId, 'spam', 'Spam Protection', null, 1]);
        await reply(message, `${emojis.success} Spam protection enabled.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to enable spam protection: ${err.message}`);
      }
      return;
    }

    if (type === 'mention') {
      const limit = parseInt(args[1] || '5');
      if (isNaN(limit) || limit < 1) {
        await reply(message, `${emojis.warning} Mention limit must be a positive number.`);
        return;
      }

      try {
        const existing = db.query('SELECT id FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, 'mention');
        
        if (existing.length > 0) {
          db.run('UPDATE automod_rules SET content = ? WHERE guild_id = ? AND rule_type = ?', [limit.toString(), guildId, 'mention']);
          await reply(message, `${emojis.success} Updated mention spam limit to ${limit}.`);
        } else {
          db.run('INSERT INTO automod_rules (guild_id, rule_type, rule_name, content, enabled) VALUES (?, ?, ?, ?, ?)',
            [guildId, 'mention', `Mention Spam (${limit}+)`, limit.toString(), 1]);
          await reply(message, `${emojis.success} Mention spam filter enabled — limit: ${limit}.`);
        }
      } catch (err) {
        await reply(message, `${emojis.error} Failed to set mention limit: ${err.message}`);
      }
      return;
    }

    if (type === 'link') {
      try {
        const existing = db.query('SELECT id FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, 'link');
        
        if (existing.length > 0) {
          await reply(message, `${emojis.warning} Link filter already enabled.`);
          return;
        }

        db.run('INSERT INTO automod_rules (guild_id, rule_type, rule_name, content, enabled) VALUES (?, ?, ?, ?, ?)',
          [guildId, 'link', 'Link Filter', null, 1]);
        await reply(message, `${emojis.success} Link filter enabled.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to enable link filter: ${err.message}`);
      }
      return;
    }

    if (type === 'invite') {
      try {
        const existing = db.query('SELECT id FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, 'invite');
        
        if (existing.length > 0) {
          await reply(message, `${emojis.warning} Discord invite filter already enabled.`);
          return;
        }

        db.run('INSERT INTO automod_rules (guild_id, rule_type, rule_name, content, enabled) VALUES (?, ?, ?, ?, ?)',
          [guildId, 'invite', 'Discord Invite Filter', null, 1]);
        await reply(message, `${emojis.success} Discord invite filter enabled.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to enable invite filter: ${err.message}`);
      }
      return;
    }

    await reply(message, `${emojis.warning} Usage: \`automod rule add keyword/spam/mention/link/invite [params]\``);
  } catch (err) {
    await reply(message, `${emojis.error} Failed to add rule: ${err.message}`);
  }
}

async function handleRuleRemove(message, args) {
  try {
    const ruleType = args[0]?.toLowerCase();
    if (!ruleType) {
      await reply(message, `${emojis.warning} Usage: \`automod rule remove <keyword/spam/mention/link/invite>\``);
      return;
    }

    const db = getDb('automod');
    const guildId = message.guild.id;

    try {
      const rule = db.query('SELECT * FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, ruleType);
      
      if (!rule.length) {
        await reply(message, `${emojis.error} Rule type \`${ruleType}\` not found.`);
        return;
      }

      db.run('DELETE FROM automod_rules WHERE guild_id = ? AND rule_type = ?', [guildId, ruleType]);
      await reply(message, `${emojis.success} Rule type \`${ruleType}\` deleted.`);
    } catch (err) {
      await reply(message, `${emojis.error} Failed to delete rule: ${err.message}`);
    }
  } catch (err) {
    await reply(message, `${emojis.error} Failed to remove rule: ${err.message}`);
  }
}

async function handleRuleToggle(message, args) {
  try {
    const ruleType = args[0]?.toLowerCase();
    if (!ruleType) {
      await reply(message, `${emojis.warning} Usage: \`automod rule toggle <keyword/spam/mention/link/invite>\``);
      return;
    }

    const db = getDb('automod');
    const guildId = message.guild.id;

    try {
      const rule = db.query('SELECT * FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, ruleType);
      
      if (!rule.length) {
        await reply(message, `${emojis.error} Rule type \`${ruleType}\` not found.`);
        return;
      }

      const newState = rule[0].enabled ? 0 : 1;
      db.run('UPDATE automod_rules SET enabled = ? WHERE guild_id = ? AND rule_type = ?', [newState, guildId, ruleType]);

      const status = newState ? '✅ enabled' : '❌ disabled';
      await reply(message, `${emojis.success} Rule \`${ruleType}\` is now ${status}.`);
    } catch (err) {
      await reply(message, `${emojis.error} Failed to toggle rule: ${err.message}`);
    }
  } catch (err) {
    await reply(message, `${emojis.error} Failed to toggle rule: ${err.message}`);
  }
}

async function handleRuleMessage(message, args) {
  try {
    const ruleType = args[0]?.toLowerCase();
    const customMsg = args.slice(1).join(' ');

    if (!ruleType || !customMsg) {
      await reply(message, `${emojis.warning} Usage: \`automod rule message <rule_type> <custom_message>\``);
      await reply(message, `${emojis.info} Use \`{user}\` as placeholder for the user mention.`);
      return;
    }

    const db = getDb('automod');
    const guildId = message.guild.id;

    try {
      const rule = db.query('SELECT * FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, ruleType);
      
      if (!rule.length) {
        await reply(message, `${emojis.error} Rule type \`${ruleType}\` not found.`);
        return;
      }

      db.run('UPDATE automod_rules SET custom_message = ? WHERE guild_id = ? AND rule_type = ?', [customMsg, guildId, ruleType]);
      await reply(message, `${emojis.success} Custom message for \`${ruleType}\` rule set:\n\`${customMsg}\``);
    } catch (err) {
      await reply(message, `${emojis.error} Failed to set custom message: ${err.message}`);
    }
  } catch (err) {
    await reply(message, `${emojis.error} Failed to set custom message: ${err.message}`);
  }
}

async function handleRuleException(message, args) {
  try {
    const sub = args[0]?.toLowerCase();
    const ruleType = args[1]?.toLowerCase();

    if (sub === 'add') {
      const target = message.mentions.roles.first() || message.mentions.members.first();
      if (!target || !ruleType) {
        await reply(message, `${emojis.warning} Usage: \`automod rule exception add <rule_type> @role/@user\``);
        return;
      }

      const db = getDb('automod');
      const guildId = message.guild.id;
      const targetId = target.id;
      const type = message.mentions.roles.first() ? 'role' : 'user';
      const displayName = target.name || target.user?.tag || targetId;

      // Check rule exists
      const rule = db.query('SELECT * FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, ruleType);
      if (!rule.length) {
        await reply(message, `${emojis.error} Rule type \`${ruleType}\` not found.`);
        return;
      }

      try {
        db.run('INSERT OR IGNORE INTO automod_rule_exceptions (guild_id, rule_type, target_id, type) VALUES (?, ?, ?, ?)',
          [guildId, ruleType, targetId, type]);
        await reply(message, `${emojis.success} **${displayName}** is now exempt from \`${ruleType}\` rule.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to add exception: ${err.message}`);
      }
      return;
    }

    if (sub === 'remove') {
      const target = message.mentions.roles.first() || message.mentions.members.first();
      if (!target || !ruleType) {
        await reply(message, `${emojis.warning} Usage: \`automod rule exception remove <rule_type> @role/@user\``);
        return;
      }

      const db = getDb('automod');
      const guildId = message.guild.id;
      const targetId = target.id;
      const displayName = target.name || target.user?.tag || targetId;

      try {
        db.run('DELETE FROM automod_rule_exceptions WHERE guild_id = ? AND rule_type = ? AND target_id = ?',
          [guildId, ruleType, targetId]);
        await reply(message, `${emojis.success} **${displayName}** is no longer exempt from \`${ruleType}\` rule.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to remove exception: ${err.message}`);
      }
      return;
    }

    if (sub === 'list') {
      const db = getDb('automod');
      const guildId = message.guild.id;

      if (!ruleType) {
        await reply(message, `${emojis.warning} Usage: \`automod rule exception list <rule_type>\``);
        return;
      }

      try {
        const exceptions = db.query('SELECT target_id, type FROM automod_rule_exceptions WHERE guild_id = ? AND rule_type = ?').all(guildId, ruleType);

        if (!exceptions.length) {
          await reply(message, `${emojis.info} No exceptions for \`${ruleType}\` rule.`);
          return;
        }

        const list = exceptions.map(e => {
          const mention = e.type === 'role' ? `<@&${e.target_id}>` : `<@${e.target_id}>`;
          return `${mention} (${e.type})`;
        }).join('\n');

        await reply(message, `${emojis.info} **Exceptions for \`${ruleType}\` rule:**\n${list}`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to list exceptions: ${err.message}`);
      }
      return;
    }

    await reply(message, `${emojis.warning} Usage: \`automod rule exception add/remove/list <rule_type> [@role/@user]\``);
  } catch (err) {
    await reply(message, `${emojis.error} Failed: ${err.message}`);
  }
}
