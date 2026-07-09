import { SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check bot latency.');

export async function execute(interaction, client) {
  await interaction.deferReply();

  const latency = Date.now() - interaction.createdTimestamp;
  const apiLatency = Math.round(client.ws.ping);
  const shardId = interaction.guild?.shardId ?? client.shard?.ids?.[0] ?? 0;

  await interaction.editReply(
    `${emojis.ping} Pong!\n` +
    `**Bot Latency:** ${latency}ms\n` +
    `**API Latency:** ${apiLatency}ms\n` +
    `**Shard:** ${shardId}`
  );
}
