import { ShardingManager } from 'discord.js';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.js';
import log from './console.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function launchShards() {
  const manager = new ShardingManager(resolve(__dirname, '..', 'index.js'), {
    token: config.token,
    totalShards: 'auto',
    respawn: true,
  });

  manager.on('shardCreate', (shard) => {
    log.info(`Launched shard #${shard.id}`);
  });

  manager.on('shardReady', (shardId) => {
    log.ready(`Shard #${shardId} ready`);
  });

  manager.on('shardDisconnect', (shardId) => {
    log.warn(`Shard #${shardId} disconnected`);
  });

  manager.on('shardReconnecting', (shardId) => {
    log.info(`Shard #${shardId} reconnecting`);
  });

  manager.spawn({ amount: 'auto', delay: 5500, timeout: 30000 })
    .then(() => log.ready('All shards spawned'))
    .catch((err) => log.error('Shard spawn error', err));

  return manager;
}

export function isSharded() {
  return !!(process.env.SHARDING_MANAGER || process.env.DISCORD_SHARD_ID);
}
