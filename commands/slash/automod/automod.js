import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getDb } from '../../../database/index.js';
import emojis from '../../../util/emoji.js';

const RULE_TYPES = [
  { name: 'keyword', value: 'keyword' },
  { name: 'spam', value: 'spam' },
  { name: 'mention', value: 'mention' },
  { name: 'link', value: 'link' },
  { name: 'invite', value: 'invite' },
];

export const data = new SlashCommandBuilder()
  .setName('automod')
  .setDescription('Manage AutoMod rules, whitelist, and link filter')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

  // Rule commands (as a subcommand group)
  .addSubcommandGroup(group =>
    group.setName('rule').setDescription('Manage automod rules')
      .addSubcommand(sub =>
        sub.setName('list').setDescription('List all AutoMod rules')
      )
      .addSubcommand(sub =>
        sub.setName('add').setDescription('Add a rule')
          .addStringOption(opt => opt.setName('type').setDescription('Rule type').setRequired(true).addChoices(...RULE_TYPES))
          .addStringOption(opt => opt.setName('words').setDescription('Comma-separated keywords (for keyword type)').setRequired(false))
          .addIntegerOption(opt => opt.setName('limit').setDescription('Mention limit (for mention type, default: 5)').setRequired(false).setMinValue(1))
      )
      .addSubcommand(sub =>
        sub.setName('remove').setDescription('Remove a rule type')
          .addStringOption(opt => opt.setName('type').setDescription('Rule type').setRequired(true).addChoices(...RULE_TYPES))
      )
      .addSubcommand(sub =>
        sub.setName('toggle').setDescription('Enable/disable a rule')
          .addStringOption(opt => opt.setName('type').setDescription('Rule type').setRequired(true).addChoices(...RULE_TYPES))
      )
      .addSubcommand(sub =>
        sub.setName('message').setDescription('Set custom warning message for a rule')
          .addStringOption(opt => opt.setName('type').setDescription('Rule type').setRequired(true).addChoices(...RULE_TYPES))
          .addStringOption(opt => opt.setName('message').setDescription('Custom message (use {user} as placeholder)').setRequired(true))
      )
      .addSubcommand(sub =>
        sub.setName('exception-add').setDescription('Exempt a role/user from a rule')
          .addStringOption(opt => opt.setName('type').setDescription('Rule type').setRequired(true).addChoices(...RULE_TYPES))
          .addRoleOption(opt => opt.setName('role').setDescription('Role to exempt').setRequired(false))
          .addUserOption(opt => opt.setName('user').setDescription('User to exempt').setRequired(false))
      )
      .addSubcommand(sub =>
        sub.setName('exception-remove').setDescription('Remove exemption for a role/user from a rule')
          .addStringOption(opt => opt.setName('type').setDescription('Rule type').setRequired(true).addChoices(...RULE_TYPES))
          .addRoleOption(opt => opt.setName('role').setDescription('Role to remove exemption').setRequired(false))
          .addUserOption(opt => opt.setName('user').setDescription('User to remove exemption').setRequired(false))
      )
      .addSubcommand(sub =>
        sub.setName('exception-list').setDescription('List all exemptions for a rule')
          .addStringOption(opt => opt.setName('type').setDescription('Rule type').setRequired(true).addChoices(...RULE_TYPES))
      )
  )

  // Whitelist commands
  .addSubcommandGroup(group =>
    group.setName('whitelist').setDescription('Manage global AutoMod whitelist')
      .addSubcommand(sub =>
        sub.setName('add').setDescription('Add a role/user to the whitelist')
          .addRoleOption(opt => opt.setName('role').setDescription('Role to whitelist').setRequired(false))
          .addUserOption(opt => opt.setName('user').setDescription('User to whitelist').setRequired(false))
      )
      .addSubcommand(sub =>
        sub.setName('remove').setDescription('Remove a role/user from the whitelist')
          .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(false))
          .addUserOption(opt => opt.setName('user').setDescription('User to remove').setRequired(false))
      )
      .addSubcommand(sub => sub.setName('show').setDescription('Show the whitelist'))
      .addSubcommand(sub => sub.setName('reset').setDescription('Clear the entire whitelist'))
  )

  // Link commands
  .addSubcommandGroup(group =>
    group.setName('link').setDescription('Manage link filter settings')
      .addSubcommand(sub =>
        sub.setName('whitelist').setDescription('Manage whitelisted domains')
          .addStringOption(opt => opt.setName('action').setDescription('Action').setRequired(true)
            .addChoices({ name: 'add', value: 'add' }, { name: 'remove', value: 'remove' }, { name: 'show', value: 'show' }, { name: 'reset', value: 'reset' }))
          .addStringOption(opt => opt.setName('domain').setDescription('Domain to add/remove (e.g. reddit.com)').setRequired(false))
      )
      .addSubcommand(sub =>
        sub.setName('bypass').setDescription('Manage link bypass roles')
          .addStringOption(opt => opt.setName('action').setDescription('Action').setRequired(true)
            .addChoices({ name: 'add', value: 'add' }, { name: 'remove', value: 'remove' }, { name: 'show', value: 'show' }))
          .addRoleOption(opt => opt.setName('role').setDescription('Role for bypass').setRequired(false))
      )
  );

export async function execute(interaction) {
  const group = interaction.options.getSubcommandGroup();
  const sub = interaction.options.getSubcommand();
  const db = getDb('automod');
  const guildId = interaction.guild.id;

  if (group === 'rule') {
    await handleRule(interaction, sub, db, guildId);
    return;
  }

  if (group === 'whitelist') {
    await handleWhitelist(interaction, sub, db, guildId);
    return;
  }

  if (group === 'link') {
    await handleLink(interaction, sub, db, guildId);
    return;
  }

  // Show overview
  const rules = db.query('SELECT rule_type, COUNT(*) as count FROM automod_rules WHERE guild_id = ? AND enabled = 1 GROUP BY rule_type').all(guildId);
  const whitelist = db.query('SELECT target_id, type FROM automod_whitelist WHERE guild_id = ?').all(guildId);
  const linkWhitelist = db.query('SELECT COUNT(*) as count FROM automod_link_whitelist WHERE guild_id = ?').all(guildId);
  const linkBypass = db.query('SELECT COUNT(*) as count FROM automod_link_bypass_roles WHERE guild_id = ?').all(guildId);

  const stats = rules.reduce((acc, r) => { acc[r.rule_type] = r.count; return acc; }, {});

  await interaction.reply(
    `${emojis.info} **AutoMod Configuration**\n` +
    `\n**Active Rules:**\n` +
    `  • Keywords: ${stats.keyword || 0}\n` +
    `  • Spam: ${stats.spam || 0}\n` +
    `  • Mentions: ${stats.mention || 0}\n` +
    `  • Links: ${stats.link || 0}\n` +
    `  • Invites: ${stats.invite || 0}\n` +
    `\n**Other:**\n` +
    `  • Whitelisted entries: ${whitelist.length}\n` +
    `  • Whitelisted domains: ${linkWhitelist[0].count}\n` +
    `  • Link bypass roles: ${linkBypass[0].count}`
  );
}

async function handleRule(interaction, sub, db, guildId) {
  if (sub === 'list') {
    const rules = db.query('SELECT id, rule_type, rule_name, content, enabled, custom_message FROM automod_rules WHERE guild_id = ? ORDER BY rule_type').all(guildId);
    if (!rules.length) {
      await interaction.reply(`${emojis.info} No AutoMod rules configured.`);
      return;
    }
    const grouped = {};
    for (const r of rules) {
      if (!grouped[r.rule_type]) grouped[r.rule_type] = [];
      grouped[r.rule_type].push(r);
    }
    let output = `${emojis.info} **AutoMod Rules:**\n\n`;
    for (const [t, list] of Object.entries(grouped)) {
      output += `**${t.toUpperCase()}**\n`;
      for (const r of list) {
        const status = r.enabled ? '✅' : '❌';
        let content = r.content;
        if (t === 'keyword') content = JSON.parse(content).join(', ');
        else if (t === 'mention') content = `Limit: ${content}`;
        const msg = r.custom_message ? ' | Custom msg' : '';
        output += `  ${status} \`${r.id}\` — ${r.rule_name} (${content})${msg}\n`;
      }
      output += '\n';
    }
    await interaction.reply(output.slice(0, 1900));
    return;
  }

  if (sub === 'add') {
    await interaction.deferReply();
    const type = interaction.options.getString('type', true);

    if (type === 'keyword') {
      const wordsStr = interaction.options.getString('words');
      if (!wordsStr) {
        await interaction.editReply(`${emojis.warning} Provide comma-separated keywords.`);
        return;
      }
      const words = wordsStr.split(',').map(w => w.trim()).filter(Boolean);
      if (!words.length) {
        await interaction.editReply(`${emojis.warning} Provide at least one keyword.`);
        return;
      }
       const existing = db.query('SELECT id FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, 'keyword');
       if (existing.length > 0) {
         const existingWords = JSON.parse(db.query('SELECT content FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, 'keyword')[0].content);
         const allWords = [...new Set([...existingWords, ...words])];
         db.run('UPDATE automod_rules SET content = ? WHERE guild_id = ? AND rule_type = ?', [JSON.stringify(allWords), guildId, 'keyword']);
         await interaction.editReply(`${emojis.success} Updated keyword filter. Added ${words.length} new words. Total: ${allWords.length}`);
       } else {
         db.run('INSERT INTO automod_rules (guild_id, rule_type, rule_name, content, enabled) VALUES (?, ?, ?, ?, ?)',
           [guildId, 'keyword', `Keyword Filter (${words.length} words)`, JSON.stringify(words), 1]);
         await interaction.editReply(`${emojis.success} Keyword filter created with ${words.length} words.`);
       }
      return;
    }

     if (type === 'spam') {
       if (db.query('SELECT id FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, 'spam').length) {
         await interaction.editReply(`${emojis.warning} Spam protection already enabled.`);
         return;
       }
       db.run('INSERT INTO automod_rules (guild_id, rule_type, rule_name, content, enabled) VALUES (?, ?, ?, ?, ?)',
         [guildId, 'spam', 'Spam Protection', null, 1]);
       await interaction.editReply(`${emojis.success} Spam protection enabled.`);
       return;
     }

     if (type === 'mention') {
       const limit = interaction.options.getInteger('limit') || 5;
       const existing = db.query('SELECT id FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, 'mention');
       if (existing.length > 0) {
         db.run('UPDATE automod_rules SET content = ? WHERE guild_id = ? AND rule_type = ?', [limit.toString(), guildId, 'mention']);
         await interaction.editReply(`${emojis.success} Updated mention spam limit to ${limit}.`);
       } else {
         db.run('INSERT INTO automod_rules (guild_id, rule_type, rule_name, content, enabled) VALUES (?, ?, ?, ?, ?)',
           [guildId, 'mention', `Mention Spam (${limit}+)`, limit.toString(), 1]);
         await interaction.editReply(`${emojis.success} Mention spam filter enabled — limit: ${limit}.`);
       }
       return;
     }

     if (type === 'link') {
       if (db.query('SELECT id FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, 'link').length) {
         await interaction.editReply(`${emojis.warning} Link filter already enabled.`);
         return;
       }
       db.run('INSERT INTO automod_rules (guild_id, rule_type, rule_name, content, enabled) VALUES (?, ?, ?, ?, ?)',
         [guildId, 'link', 'Link Filter', null, 1]);
       await interaction.editReply(`${emojis.success} Link filter enabled.`);
       return;
     }

     if (type === 'invite') {
       if (db.query('SELECT id FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, 'invite').length) {
         await interaction.editReply(`${emojis.warning} Invite filter already enabled.`);
         return;
       }
       db.run('INSERT INTO automod_rules (guild_id, rule_type, rule_name, content, enabled) VALUES (?, ?, ?, ?, ?)',
         [guildId, 'invite', 'Discord Invite Filter', null, 1]);
       await interaction.editReply(`${emojis.success} Discord invite filter enabled.`);
       return;
     }

    await interaction.editReply(`${emojis.warning} Unknown rule type.`);
    return;
  }

  if (sub === 'remove') {
    const type = interaction.options.getString('type', true);
    if (!db.query('SELECT * FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, type).length) {
      await interaction.reply({ content: `${emojis.error} Rule type \`${type}\` not found.`, flags: MessageFlags.Ephemeral });
      return;
    }
    db.run('DELETE FROM automod_rules WHERE guild_id = ? AND rule_type = ?', [guildId, type]);
    await interaction.reply(`${emojis.success} Rule type \`${type}\` deleted.`);
    return;
  }

  if (sub === 'toggle') {
    const type = interaction.options.getString('type', true);
    const rule = db.query('SELECT * FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, type);
    if (!rule.length) {
      await interaction.reply({ content: `${emojis.error} Rule type \`${type}\` not found.`, flags: MessageFlags.Ephemeral });
      return;
    }
    const newState = rule[0].enabled ? 0 : 1;
    db.run('UPDATE automod_rules SET enabled = ? WHERE guild_id = ? AND rule_type = ?', [newState, guildId, type]);
    await interaction.reply(`${emojis.success} Rule \`${type}\` is now ${newState ? '✅ enabled' : '❌ disabled'}.`);
    return;
  }

  if (sub === 'message') {
    const type = interaction.options.getString('type', true);
    const msg = interaction.options.getString('message', true);
    if (!db.query('SELECT * FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, type).length) {
      await interaction.reply({ content: `${emojis.error} Rule type \`${type}\` not found.`, flags: MessageFlags.Ephemeral });
      return;
    }
    db.run('UPDATE automod_rules SET custom_message = ? WHERE guild_id = ? AND rule_type = ?', [msg, guildId, type]);
    await interaction.reply(`${emojis.success} Custom message for \`${type}\` rule set:\n\`${msg}\``);
    return;
  }

  if (sub === 'exception-add') {
    const type = interaction.options.getString('type', true);
    const role = interaction.options.getRole('role');
    const user = interaction.options.getUser('user');

    if (!db.query('SELECT * FROM automod_rules WHERE guild_id = ? AND rule_type = ?').all(guildId, type).length) {
      await interaction.reply({ content: `${emojis.error} Rule type \`${type}\` not found.`, flags: MessageFlags.Ephemeral });
      return;
    }
    if (!role && !user) {
      await interaction.reply({ content: `${emojis.warning} Provide a role or user.`, flags: MessageFlags.Ephemeral });
      return;
    }
     if (role) {
       db.run('INSERT OR IGNORE INTO automod_rule_exceptions (guild_id, rule_type, target_id, type) VALUES (?, ?, ?, ?)', [guildId, type, role.id, 'role']);
       await interaction.reply(`${emojis.success} **${role.name}** is now exempt from \`${type}\` rule.`);
     } else {
       db.run('INSERT OR IGNORE INTO automod_rule_exceptions (guild_id, rule_type, target_id, type) VALUES (?, ?, ?, ?)', [guildId, type, user.id, 'user']);
       await interaction.reply(`${emojis.success} **${user.tag}** is now exempt from \`${type}\` rule.`);
     }
    return;
  }

  if (sub === 'exception-remove') {
    const type = interaction.options.getString('type', true);
    const role = interaction.options.getRole('role');
    const user = interaction.options.getUser('user');
    if (!role && !user) {
      await interaction.reply({ content: `${emojis.warning} Provide a role or user.`, flags: MessageFlags.Ephemeral });
      return;
    }
     if (role) {
       db.run('DELETE FROM automod_rule_exceptions WHERE guild_id = ? AND rule_type = ? AND target_id = ?', [guildId, type, role.id]);
       await interaction.reply(`${emojis.success} **${role.name}** is no longer exempt from \`${type}\` rule.`);
     } else {
       db.run('DELETE FROM automod_rule_exceptions WHERE guild_id = ? AND rule_type = ? AND target_id = ?', [guildId, type, user.id]);
       await interaction.reply(`${emojis.success} **${user.tag}** is no longer exempt from \`${type}\` rule.`);
     }
    return;
  }

  if (sub === 'exception-list') {
    const type = interaction.options.getString('type', true);
    const exceptions = db.query('SELECT target_id, type FROM automod_rule_exceptions WHERE guild_id = ? AND rule_type = ?').all(guildId, type);
    if (!exceptions.length) {
      await interaction.reply(`${emojis.info} No exceptions for \`${type}\` rule.`);
      return;
    }
    const list = exceptions.map(e => `${e.type === 'role' ? `<@&${e.target_id}>` : `<@${e.target_id}>`} (${e.type})`).join('\n');
    await interaction.reply(`${emojis.info} **Exceptions for \`${type}\` rule:**\n${list}`);
    return;
  }
}

async function handleWhitelist(interaction, sub, db, guildId) {
  if (sub === 'add') {
    const role = interaction.options.getRole('role');
    const user = interaction.options.getUser('user');
    if (!role && !user) {
      await interaction.reply({ content: `${emojis.warning} Provide a role or user.`, flags: MessageFlags.Ephemeral });
      return;
    }
     if (role) {
       db.run('INSERT OR IGNORE INTO automod_whitelist (guild_id, target_id, type) VALUES (?, ?, ?)', [guildId, role.id, 'role']);
       await interaction.reply(`${emojis.success} **${role.name}** added to AutoMod whitelist.`);
     } else {
       db.run('INSERT OR IGNORE INTO automod_whitelist (guild_id, target_id, type) VALUES (?, ?, ?)', [guildId, user.id, 'user']);
       await interaction.reply(`${emojis.success} **${user.tag}** added to AutoMod whitelist.`);
     }
    return;
  }

  if (sub === 'remove') {
    const role = interaction.options.getRole('role');
    const user = interaction.options.getUser('user');
    if (!role && !user) {
      await interaction.reply({ content: `${emojis.warning} Provide a role or user.`, flags: MessageFlags.Ephemeral });
      return;
    }
     if (role) {
       db.run('DELETE FROM automod_whitelist WHERE guild_id = ? AND target_id = ?', [guildId, role.id]);
       await interaction.reply(`${emojis.success} **${role.name}** removed from AutoMod whitelist.`);
     } else {
       db.run('DELETE FROM automod_whitelist WHERE guild_id = ? AND target_id = ?', [guildId, user.id]);
       await interaction.reply(`${emojis.success} **${user.tag}** removed from AutoMod whitelist.`);
     }
    return;
  }

  if (sub === 'show') {
    const rows = db.query('SELECT target_id, type FROM automod_whitelist WHERE guild_id = ?').all(guildId);
    if (!rows.length) {
      await interaction.reply(`${emojis.info} No whitelist entries.`);
      return;
    }
    const list = rows.map(r => `${r.type === 'role' ? `<@&${r.target_id}>` : `<@${r.target_id}>`} (${r.type.charAt(0).toUpperCase() + r.type.slice(1)})`).join('\n');
    await interaction.reply(`${emojis.info} **AutoMod Whitelist (${rows.length} entries):**\n${list}`);
    return;
  }

  if (sub === 'reset') {
    db.run('DELETE FROM automod_whitelist WHERE guild_id = ?', [guildId]);
    await interaction.reply(`${emojis.success} AutoMod whitelist reset.`);
    return;
  }
}

async function handleLink(interaction, sub, db, guildId) {
  if (sub === 'whitelist') {
    const action = interaction.options.getString('action', true);
    const domain = interaction.options.getString('domain');

    if (action === 'add') {
      if (!domain) {
        await interaction.reply({ content: `${emojis.warning} Provide a domain to add.`, flags: MessageFlags.Ephemeral });
        return;
      }
       db.run('INSERT OR IGNORE INTO automod_link_whitelist (guild_id, domain) VALUES (?, ?)', [guildId, domain.toLowerCase()]);
       await interaction.reply(`${emojis.success} Domain \`${domain}\` added to link whitelist.`);
      return;
    }

    if (action === 'remove') {
      if (!domain) {
        await interaction.reply({ content: `${emojis.warning} Provide a domain to remove.`, flags: MessageFlags.Ephemeral });
        return;
      }
       db.run('DELETE FROM automod_link_whitelist WHERE guild_id = ? AND domain = ?', [guildId, domain.toLowerCase()]);
       await interaction.reply(`${emojis.success} Domain \`${domain}\` removed from link whitelist.`);
      return;
    }

    if (action === 'show') {
      const whitelisted = db.query('SELECT domain FROM automod_link_whitelist WHERE guild_id = ?').all(guildId);
      const defaults = ['tenor.com', 'giphy.com', 'imgur.com', 'media.discordapp.net', 'cdn.discordapp.com'];
      const custom = whitelisted.map(w => w.domain);
      let output = `${emojis.info} **Whitelisted Domains:**\n\n**Default:**\n${defaults.map(d => `  • \`${d}\``).join('\n')}`;
      output += `\n\n**Custom:**\n${custom.length ? custom.map(d => `  • \`${d}\``).join('\n') : 'None'}`;
      await interaction.reply(output);
      return;
    }

     if (action === 'reset') {
       db.run('DELETE FROM automod_link_whitelist WHERE guild_id = ?', [guildId]);
       await interaction.reply(`${emojis.success} Link whitelist reset. Default domains are still allowed.`);
       return;
     }
  }

  if (sub === 'bypass') {
    const action = interaction.options.getString('action', true);
    const role = interaction.options.getRole('role');

    if (action === 'add') {
      if (!role) {
        await interaction.reply({ content: `${emojis.warning} Provide a role for link bypass.`, flags: MessageFlags.Ephemeral });
        return;
      }
       db.run('INSERT OR IGNORE INTO automod_link_bypass_roles (guild_id, role_id) VALUES (?, ?)', [guildId, role.id]);
       await interaction.reply(`${emojis.success} **${role.name}** can now bypass link filter.`);
      return;
    }

    if (action === 'remove') {
      if (!role) {
        await interaction.reply({ content: `${emojis.warning} Provide a role to remove bypass.`, flags: MessageFlags.Ephemeral });
        return;
      }
       db.run('DELETE FROM automod_link_bypass_roles WHERE guild_id = ? AND role_id = ?', [guildId, role.id]);
       await interaction.reply(`${emojis.success} **${role.name}** link bypass removed.`);
      return;
    }

    if (action === 'show') {
      const bypassed = db.query('SELECT role_id FROM automod_link_bypass_roles WHERE guild_id = ?').all(guildId);
      if (!bypassed.length) {
        await interaction.reply(`${emojis.info} No roles have link filter bypass.`);
        return;
      }
      await interaction.reply(`${emojis.info} **Roles with Link Filter Bypass:**\n${bypassed.map(b => `<@&${b.role_id}>`).join('\n')}`);
      return;
    }
  }
}
