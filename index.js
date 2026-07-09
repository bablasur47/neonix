import { Client, Collection, GatewayIntentBits, REST, Routes, DefaultWebSocketManagerOptions, Partials, Events } from 'discord.js';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import config from './util/config.js';
import { launchShards } from './util/shard.js';
import { setupRiffy } from './util/riffy.js';
import log from './util/console.js';
import { start as startDashboard } from './dashboard/server.js';
import { setupAntiCrash, setupGracefulShutdown } from './util/anticrash.js';
import { connect, getDb } from './database/index.js';

const isShardProcess = !!(process.env.SHARDING_MANAGER || process.env.DISCORD_SHARD_ID);

if (!isShardProcess && process.argv.includes('--shard')) {
  launchShards();
  process.exit(0);
}

export async function loadCommands(client) {
  client.prefixCommands = new Collection();
  client.slashCommands = new Collection();
  client.commands = new Collection();

  const prefixPath = join(import.meta.dir, 'commands', 'prefix');
  const slashPath = join(import.meta.dir, 'commands', 'slash');

  client.commandCategories = new Map();
  client.prefixCategories = new Map();

  async function walk(dir, collection, isSlash, baseDir) {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, collection, isSlash, baseDir || dir);
      } else if (entry.name.endsWith('.js')) {
        try {
          const cmd = await import(fullPath);
          const rel = baseDir ? dir.slice(baseDir.length + 1) : '';
          const category = rel || (isSlash ? 'slash' : 'general');
          if (isSlash && cmd.data) {
            collection.set(cmd.data.name, cmd);
            client.commands.set(cmd.data.name, cmd);
            client.commandCategories.set(cmd.data.name, category);
          } else if (!isSlash && cmd.name) {
            collection.set(cmd.name, cmd);
            client.commands.set(cmd.name, cmd);
            client.commandCategories.set(cmd.name, category);
            client.prefixCategories.set(cmd.name, category);
            if (cmd.aliases) {
              for (const alias of cmd.aliases) {
                collection.set(alias, cmd);
              }
            }
          }
        } catch (err) {
          log.error(`Failed to load ${fullPath}`, err);
        }
      }
    }
  }

  await walk(prefixPath, client.prefixCommands, false, prefixPath);
  await walk(slashPath, client.slashCommands, true, slashPath);

  log.load(`Loaded ${client.prefixCommands.size} prefix commands`);
  log.load(`Loaded ${client.slashCommands.size} slash commands`);
}

export async function loadEvents(client) {
  const eventsPath = join(import.meta.dir, 'events');
  if (!existsSync(eventsPath)) return;

  const categories = readdirSync(eventsPath, { withFileTypes: true });
  for (const cat of categories) {
    if (!cat.isDirectory()) continue;
    const catPath = join(eventsPath, cat.name);
    const files = readdirSync(catPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      try {
        const event = await import(join(catPath, file));
        const fn = (...args) => {
          try {
            const result = event.execute(...args, client);
            if (result instanceof Promise) {
              result.catch(err => {
                log.error(`Event error: ${cat.name}/${file}`, err);
              });
            }
          } catch (err) {
            log.error(`Event error: ${cat.name}/${file}`, err);
          }
        };
        if (event.once) {
          client.once(event.name, fn);
        } else {
          client.on(event.name, fn);
        }
        log.load(`Loaded ${cat.name}/${file}`);
      } catch (err) {
        log.error(`Failed to load ${cat.name}/${file}`, err);
      }
    }
  }
}

export async function registerSlashCommands(client) {
  try {
    const commands = [];
    for (const cmd of client.slashCommands.values()) {
      if (cmd.data) commands.push(cmd.data.toJSON());
    }

    if (commands.length === 0) return;

    const rest = new REST({ version: '10' }).setToken(config.token);

    const existing = await rest.get(Routes.applicationCommands(config.clientId));
    const existingJSON = existing.map(c => JSON.stringify(c));
    const newJSON = commands.map(c => JSON.stringify(c));

    const same = existingJSON.length === newJSON.length && existingJSON.every((v, i) => v === newJSON[i]);
    if (same) {
      log.slash(`${commands.length} commands already registered, skipping`);
      return;
    }

    log.slash(`Registering ${commands.length} global slash commands...`);
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    log.slash(`Successfully registered ${commands.length} global slash commands`);
  } catch (err) {
    log.error('Failed to register commands', err);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
  ],
  allowedMentions: { parse: [], repliedUser: false },
  failIfNotExists: false,
});

async function init() {
  await connect();

  for (const name of ['guilds', 'noprefix', 'afk', 'media', 'extra', 'giveaways']) {
    try { await getDb(name).load(); } catch {}
  }

  setupAntiCrash(client);
  setupGracefulShutdown(client);

  await loadEvents(client);
  await loadCommands(client);
  await registerSlashCommands(client);
  setupRiffy(client);

  DefaultWebSocketManagerOptions.identifyProperties.browser = 'Discord Android';

  await client.login(config.token);

  if (!isShardProcess) {
    client.once(Events.ClientReady, () => startDashboard(client));
  }
}

init().catch(err => log.error('Init failed', err));

export default client;
