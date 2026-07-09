import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'shardstats';
export const description = 'Show shard statistics.';
export const usage = 'shardstats';
export const aliases = ['shards', 'shardinfo'];

export async function execute(message, args, client) {
  const shardId = message.guild?.shardId ?? 0;

  if (!client.shard) {
    await reply(message, 
      `${emojis.info} **Shard Stats**\n` +
      `Shard ID: ${shardId}\n` +
      `Total Shards: 1 (not sharded)\n` +
      `Status: 🟢 Online`
    );
    return;
  }

  const shardInfo = await client.shard.broadcastEval(c => ({
    id: c.shard?.ids?.[0] ?? 0,
    guilds: c.guilds.cache.size,
    users: c.users.cache.size,
    ping: c.ws.ping,
    uptime: process.uptime(),
  }));

  const lines = shardInfo.map(s =>
    `Shard #${s.id} — ${s.guilds} guilds, ${s.users} users, ${s.ping}ms ping`
  );

  await reply(message, `${emojis.info} **Shards** (${shardInfo.length} total):\n${lines.join('\n')}`);
}
