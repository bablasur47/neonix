import { sendLog, makeEmbed } from './logger.js';
import { closeAll } from '../database/index.js';
import log from './console.js';

const memoryThreshold = parseInt(process.env.MEMORY_THRESHOLD_MB || '1024');
let healthInterval = null;

export function setupAntiCrash(client) {
  process.on('uncaughtException', (err) => {
    log.error('UNCAUGHT EXCEPTION', err);
    sendLog([makeEmbed({
      color: 0xED4245,
      title: 'Uncaught Exception',
      description: `\`\`\`\n${err.stack?.slice(0, 1900) || err.message}\n\`\`\``,
    })]);
  });

  process.on('unhandledRejection', (reason) => {
    if (reason instanceof Error) {
      log.error('UNHANDLED REJECTION', reason);
    } else {
      log.error('UNHANDLED REJECTION', new Error(String(reason)));
    }
  });

  process.on('warning', (warning) => {
    if (warning.name === 'DeprecationWarning') return;
    log.warn(`[WARNING] ${warning.name}: ${warning.message}`);
  });

  startHealthMonitor(client);
}

export function setupGracefulShutdown(client) {
  const shutdown = async (signal) => {
    log.warn(`Received ${signal}, shutting down gracefully...`);

    if (client.riffy) {
      const players = client.riffy.players;
      if (players) {
        for (const [, player] of players) {
          try { player.destroy(); } catch {}
        }
      }
    }

    try { client.destroy(); } catch {}

    closeAll();

    if (healthInterval) clearInterval(healthInterval);

    log.ready('Shutdown complete.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

function startHealthMonitor(client) {
  let lastUptimeWarning = 0;

  healthInterval = setInterval(() => {
    const mem = process.memoryUsage();
    const heapMB = Math.round(mem.heapUsed / 1024 / 1024);
    const rssMB = Math.round(mem.rss / 1024 / 1024);

    if (heapMB > memoryThreshold && Date.now() - lastUptimeWarning > 60000) {
      lastUptimeWarning = Date.now();
      log.warn(`Memory usage high: ${heapMB}MB heap, ${rssMB}MB RSS`);

      sendLog([makeEmbed({
        color: 0xF59E0B,
        title: 'High Memory Usage',
        description: `Heap: **${heapMB}MB** / RSS: **${rssMB}MB**\nThreshold: **${memoryThreshold}MB**`,
      })]);

      if (global.gc) {
        global.gc();
        log.info('GC triggered');
      }
    }

    const uptime = Math.floor(process.uptime());
    if (uptime > 0 && uptime % 3600 === 0 && uptime > lastUptimeWarning) {
      log.info(`Health: ${heapMB}MB heap, ${rssMB}MB RSS, ${client.guilds?.cache?.size || 0} guilds`);
    }
  }, 30000);
}
