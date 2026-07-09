import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } from 'discord.js';
import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'modmail-setup';
export const description = 'Setup the modmail system in this server.';
export const usage = 'modmail-setup <#channel>';
export const aliases = ['mm-setup'];

export async function execute(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
    await reply(message, `${emojis.error} You need Administrator permission to setup modmail.`);
    return;
  }

  const targetChannel = message.mentions.channels.first();
  if (!targetChannel) {
    await reply(message, `${emojis.warning} Usage: \`modmail-setup #channel\``);
    return;
  }

  const db = getDb('modmail');
  const existing = db.query('SELECT * FROM modmail_config WHERE guild_id = ?').get(message.guild.id);
  if (existing) {
    await reply(message, `${emojis.warning} Modmail is already setup in <#${existing.channel_id}>. Use \`modmail-reset\` first.`);
    return;
  }

  const logChannel = await message.guild.channels.create({
    name: 'modmail-logs',
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: message.guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: message.client.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageThreads, PermissionFlagsBits.ReadMessageHistory],
      },
    ],
    reason: 'Modmail log channel',
  });

  const embed = new EmbedBuilder()
    .setTitle('Modmail System')
    .setDescription(
      'Need help or want to contact the staff?\n\n' +
      'Click the button below to open a modmail ticket. Your message will be sent directly to the moderators.\n\n' +
      '**How it works:**\n' +
      '• Click the button below\n' +
      '• Fill out the application form\n' +
      '• Staff will receive your message\n' +
      '• Wait for a response from the team'
    )
    .setColor(0x2B2D31)
    .setThumbnail(message.guild.iconURL({ size: 256 }));

  const button = new ButtonBuilder()
    .setCustomId('modmail_open')
    .setLabel('Open Modmail Ticket')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('📧');

  const row = new ActionRowBuilder().addComponents(button);
  const sent = await targetChannel.send({ embeds: [embed], components: [row] });

  db.run(
    'INSERT INTO modmail_config (guild_id, channel_id, log_channel_id) VALUES (?, ?, ?)',
    message.guild.id, targetChannel.id, logChannel.id
  );

  await reply(message,
    `${emojis.success} Modmail system setup!\n` +
    `• Public channel: <#${targetChannel.id}>\n` +
    `• Staff log channel: <#${logChannel.id}>\n\n` +
    `Use \`modmail-role add @role\` to give staff roles access to ticket channels.`
  );
}
