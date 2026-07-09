import { send, edit } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'ping';
export const description = 'Check bot latency.';
export const usage = 'ping';
export const aliases = ['pong'];

export async function execute(message, args, client) {
  const sent = await send(message.channel, `${emojis.loading} Pinging...`);
  const latency = sent.createdTimestamp - message.createdTimestamp;
  const apiLatency = Math.round(client.ws.ping);

  await edit(sent, 
    `${emojis.ping} Pong!\n` +
    `**Bot Latency:** ${latency}ms\n` +
    `**API Latency:** ${apiLatency}ms`
  );
}
