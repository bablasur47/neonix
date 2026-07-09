import { EmbedBuilder } from 'discord.js';

const ACCENT = 0x2B2D31;

function toEmbed(content) {
  const text = Array.isArray(content) ? content.filter(Boolean).join('\n') : String(content);
  return new EmbedBuilder().setDescription(text).setColor(ACCENT);
}

export function reply(message, content) {
  return message.reply({ embeds: [toEmbed(content)] });
}

export function edit(message, content) {
  return message.edit({ embeds: [toEmbed(content)] });
}

export function send(channel, content) {
  return channel.send({ embeds: [toEmbed(content)] });
}

export function replyWithImage(message, text, imageUrl) {
  return message.reply({
    embeds: [new EmbedBuilder().setDescription(text).setColor(ACCENT).setImage(imageUrl)],
  });
}
