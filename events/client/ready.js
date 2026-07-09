import { Events, ActivityType } from 'discord.js';
import { getDb } from '../../database/index.js';
import config from '../../util/config.js';
import log from '../../util/console.js';
import { refreshNopCache } from '../../events/guild/messageCreate.js';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client) {
  log.ready(`Logged in as ${client.user.tag}`);
  refreshNopCache();

  const statuses = [
    { name: `${config.initialPrefix}help`, type: ActivityType.Listening },
    { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
    { name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`, type: ActivityType.Watching },
    { name: 'music 24/7', type: ActivityType.Playing },
    { name: 'discord', type: ActivityType.Competing },
  ];

  let i = 0;
  const update = () => {
    const s = statuses[i % statuses.length];
    client.user.setPresence({ activities: [{ name: s.name, type: s.type }], status: 'online' });
    i++;
  };
  update();
  setInterval(update, 30000);

  if (client.riffy) {
    client.riffy.init(client.user.id);
    log.music('Connecting to Lavalink node(s)...');
    for (let i = 0; i < 30; i++) {
      if (client.riffy.leastUsedNodes.length > 0) break;
      await new Promise(r => setTimeout(r, 2000));
    }
    if (client.riffy.leastUsedNodes.length > 0) {
      log.music(`Node(s) connected — ${client.riffy.leastUsedNodes.length} available`);
    } else {
      log.warn('No Lavalink node connected after 60s');
    }
  }

  if (!client.snipeCache) client.snipeCache = new Map();

  const gDb = getDb('giveaways');
  setInterval(async () => {
    try {
      const expired = await gDb.query(
        "SELECT * FROM giveaways WHERE ended = 0 AND datetime(ends_at) <= datetime('now')"
      ).all();

      for (const g of expired) {
        const guild = client.guilds.cache.get(g.guild_id);
        if (!guild) continue;

        const channel = guild.channels.cache.get(g.channel_id);
        if (!channel) continue;

        let msg;
        try {
          msg = await channel.messages.fetch(g.message_id);
        } catch {
          await gDb.run('UPDATE giveaways SET ended = 1 WHERE id = ?', [g.id]);
          await gDb.run('DELETE FROM giveaway_entries WHERE message_id = ?', [g.message_id]);
          continue;
        }

        const buttonEntries = await gDb.query('SELECT user_id FROM giveaway_entries WHERE message_id = ?').all(g.message_id);
        let rawEntries = buttonEntries.map(e => e.user_id);

        let entries = rawEntries;
        if (g.required_role) {
          await guild.members.fetch();
          entries = rawEntries.filter(id => {
            const m = guild.members.cache.get(id);
            if (!m) return false;
            const hasRequired = m.roles.cache.has(g.required_role);
            const hasBypass = g.bypass_role ? m.roles.cache.has(g.bypass_role) : false;
            return hasRequired || hasBypass;
          });
        } else if (g.bypass_role) {
          await guild.members.fetch();
          entries = rawEntries.filter(id => {
            const m = guild.members.cache.get(id);
            return m && m.roles.cache.has(g.bypass_role);
          });
        }

        const winnerCount = Math.min(g.winners, entries.length);
        const picked = [];

        if (winnerCount > 0) {
          const shuffled = [...entries].sort(() => Math.random() - 0.5);
          for (let i = 0; i < winnerCount; i++) {
            picked.push(shuffled[i]);
          }
        }

        await gDb.run('UPDATE giveaways SET ended = 1 WHERE id = ?', [g.id]);

        if (!picked.length) {
          await channel.send(`${g.host_id ? `<@${g.host_id}> ` : ''}**Giveaway Ended — ${g.prize}**\nNo valid entries.`);
          continue;
        }

        const winnerMentions = picked.map(id => `<@${id}>`).join(' ');
        await channel.send(
          `${winnerMentions}\n**Giveaway Ended!** You won **${g.prize}**! (<@${g.host_id}>)`
        );

        try { await msg.edit({ embeds: [] }); } catch {}
      }
    } catch (err) {
      log.error('Giveaway check error', err);
    }
  }, 30000);

  const { sendLog, makeEmbed } = await import('../../util/logger.js');
  await sendLog([makeEmbed({
    color: 0x57F287,
    title: 'Bot Online',
    description: `**${client.user.tag}** started successfully`,
    fields: [
      { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
      { name: 'Shards', value: `${client.ws.shards.size}`, inline: true },
    ],
  })]);
}
