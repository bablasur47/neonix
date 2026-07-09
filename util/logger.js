import config from './config.js';

const webhookUrl = config.webhookUrl;

export async function sendLog(embeds) {
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: Array.isArray(embeds) ? embeds : [embeds] }),
    });
  } catch {}
}

export function makeEmbed(data) {
  return {
    color: data.color ?? 0x2B2D31,
    title: data.title,
    description: data.description,
    fields: data.fields ?? [],
    timestamp: data.timestamp ?? new Date().toISOString(),
    thumbnail: data.thumbnail ? { url: data.thumbnail } : undefined,
    image: data.image ? { url: data.image } : undefined,
    footer: data.footer ? { text: data.footer } : undefined,
  };
}
