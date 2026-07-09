import { reply } from '../../../util/components.js';

export const name = 'stats';
export const description = 'Show detailed bot statistics.';
export const usage = 'stats';

export async function execute(message, args) {
  const client = message.client;
  const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
  const uptime = process.uptime();
  const d = Math.floor(uptime / 86400);
  const h = Math.floor((uptime % 86400) / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

  const fmt = (label, val) => `  ${label.padEnd(10)} ${val}`;

  const lines = [
    `╭── ${client.user.username} ` + `─`.repeat(30),
    ``,
    `  SYSTEM`,
    fmt('Uptime',   `${d}d ${h}h ${m}m ${s}s`),
    fmt('Memory',   `${mem} MB`),
    fmt('Runtime',  `Bun ${Bun.version}`),
    fmt('Library',  `discord.js 14`),
    ``,
    `  DISCORD`,
    fmt('Servers',  client.guilds.cache.size),
    fmt('Users',    totalUsers),
    fmt('Commands', client.commands.size),
    fmt('Ping',     `${client.ws.ping}ms`),
    ``,
    `╰` + `─`.repeat(38),
  ];

  await reply(message, '```\n' + lines.join('\n') + '\n```');
}
