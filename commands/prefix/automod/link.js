import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export async function handleLink(message, args) {
  try {
    const sub = args[0]?.toLowerCase();

    if (sub === 'whitelist') {
      await handleLinkWhitelist(message, args.slice(1));
      return;
    }

    if (sub === 'bypass') {
      await handleLinkBypass(message, args.slice(1));
      return;
    }

    await reply(message, `${emojis.warning} Usage: \`automod link whitelist/bypass\``);
  } catch (err) {
    await reply(message, `${emojis.error} An unexpected error occurred.`);
  }
}

async function handleLinkWhitelist(message, args) {
  try {
    const sub = args[0]?.toLowerCase();
    const db = getDb('automod');
    const guildId = message.guild.id;

    if (sub === 'add') {
      const domain = args[1]?.toLowerCase();
      if (!domain) {
        await reply(message, `${emojis.warning} Usage: \`automod link whitelist add <domain>\``);
        await reply(message, `${emojis.info} Example: \`automod link whitelist add tenor.com\``);
        return;
      }

      try {
        db.run('INSERT OR IGNORE INTO automod_link_whitelist (guild_id, domain) VALUES (?, ?)',
          [guildId, domain]);
        await reply(message, `${emojis.success} Domain \`${domain}\` added to link whitelist.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to add domain: ${err.message}`);
      }
      return;
    }

    if (sub === 'remove') {
      const domain = args[1]?.toLowerCase();
      if (!domain) {
        await reply(message, `${emojis.warning} Usage: \`automod link whitelist remove <domain>\``);
        return;
      }

      try {
        db.run('DELETE FROM automod_link_whitelist WHERE guild_id = ? AND domain = ?',
          [guildId, domain]);
        await reply(message, `${emojis.success} Domain \`${domain}\` removed from link whitelist.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to remove domain: ${err.message}`);
      }
      return;
    }

    if (sub === 'show' || !sub) {
      try {
        const whitelisted = db.query('SELECT domain FROM automod_link_whitelist WHERE guild_id = ?').all(guildId);
        
        const defaultList = ['tenor.com', 'giphy.com', 'imgur.com', 'media.discordapp.net', 'cdn.discordapp.com'];
        const customList = whitelisted.map(w => w.domain);
        
        let output = `${emojis.info} **Whitelisted Domains (Link Filter):**\n\n`;
        output += `**Default Whitelisted:**\n`;
        output += defaultList.map(d => `  • \`${d}\``).join('\n') + '\n\n';
        
        if (customList.length > 0) {
          output += `**Custom Whitelisted:**\n`;
          output += customList.map(d => `  • \`${d}\``).join('\n');
        } else {
          output += `**Custom Whitelisted:** None`;
        }

        await reply(message, output);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to show whitelist: ${err.message}`);
      }
      return;
    }

    if (sub === 'reset') {
      try {
        db.run('DELETE FROM automod_link_whitelist WHERE guild_id = ?', [guildId]);
        await reply(message, `${emojis.success} Link whitelist reset. Only default domains are whitelisted.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to reset whitelist: ${err.message}`);
      }
      return;
    }

    await reply(message, `${emojis.warning} Usage: \`automod link whitelist add/remove/show/reset\``);
  } catch (err) {
    await reply(message, `${emojis.error} Failed: ${err.message}`);
  }
}

async function handleLinkBypass(message, args) {
  try {
    const sub = args[0]?.toLowerCase();
    const db = getDb('automod');
    const guildId = message.guild.id;

    if (sub === 'add') {
      const target = message.mentions.roles.first();
      if (!target) {
        await reply(message, `${emojis.warning} Usage: \`automod link bypass add @role\``);
        await reply(message, `${emojis.info} Members with this role can send any links.`);
        return;
      }

      try {
        db.run('INSERT OR IGNORE INTO automod_link_bypass_roles (guild_id, role_id) VALUES (?, ?)',
          [guildId, target.id]);
        await reply(message, `${emojis.success} **${target.name}** can now bypass link filter.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to add bypass role: ${err.message}`);
      }
      return;
    }

    if (sub === 'remove') {
      const target = message.mentions.roles.first();
      if (!target) {
        await reply(message, `${emojis.warning} Usage: \`automod link bypass remove @role\``);
        return;
      }

      try {
        db.run('DELETE FROM automod_link_bypass_roles WHERE guild_id = ? AND role_id = ?',
          [guildId, target.id]);
        await reply(message, `${emojis.success} **${target.name}** link bypass removed.`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to remove bypass role: ${err.message}`);
      }
      return;
    }

    if (sub === 'show' || !sub) {
      try {
        const bypassed = db.query('SELECT role_id FROM automod_link_bypass_roles WHERE guild_id = ?').all(guildId);

        if (!bypassed.length) {
          await reply(message, `${emojis.info} No roles have link filter bypass.`);
          return;
        }

        const list = bypassed.map(b => `<@&${b.role_id}>`).join('\n');
        await reply(message, `${emojis.info} **Roles with Link Filter Bypass:**\n${list}`);
      } catch (err) {
        await reply(message, `${emojis.error} Failed to show bypass roles: ${err.message}`);
      }
      return;
    }

    await reply(message, `${emojis.warning} Usage: \`automod link bypass add/remove/show\``);
  } catch (err) {
    await reply(message, `${emojis.error} Failed: ${err.message}`);
  }
}
