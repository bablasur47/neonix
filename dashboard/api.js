let clientRef = null;

export function setClient(client) {
  clientRef = client;
}

function getPing() {
  if (!clientRef?.ws) return 0;
  try {
    const shard = clientRef.ws.shards?.first();
    if (shard && typeof shard.ping === 'number' && shard.ping >= 0) return Math.round(shard.ping);
    if (typeof clientRef.ws.ping === 'number' && clientRef.ws.ping >= 0) return Math.round(clientRef.ws.ping);
  } catch {}
  return 0;
}

export function handleStats() {
  return {
    uptime: clientRef?.uptime ?? 0,
    ping: getPing(),
    memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
    servers: clientRef?.guilds?.cache?.size ?? 0,
    users: clientRef?.guilds?.cache?.reduce((a, g) => a + g.memberCount, 0) ?? 0,
  };
}
