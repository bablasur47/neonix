import { Events } from 'discord.js';

export const name = Events.MessageDelete;

export async function execute(message) {
  if (!message.author?.bot && message.content && message.guild) {
    if (!message.client.snipeCache) message.client.snipeCache = new Map();
    message.client.snipeCache.set(message.channel.id, {
      author: message.author.tag,
      content: message.content,
      timestamp: Date.now(),
    });
  }
}
