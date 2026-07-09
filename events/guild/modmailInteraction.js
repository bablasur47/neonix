import { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { getDb } from '../../database/index.js';
import emojis from '../../util/emoji.js';

export const name = Events.InteractionCreate;

export async function execute(interaction, client) {

  /* ─── OPEN MODMAIL BUTTON ─── */
  if (interaction.isButton() && interaction.customId === 'modmail_open') {
    const db = getDb('modmail');
    const config = db.query('SELECT * FROM modmail_config WHERE guild_id = ?').get(interaction.guildId);
    if (!config) {
      await interaction.reply({ content: 'Modmail is not configured in this server.', flags: MessageFlags.Ephemeral });
      return;
    }

    const blocked = db.query(
      'SELECT target_id, type FROM modmail_blocked WHERE guild_id = ?'
    ).all(interaction.guildId);

    const isBlocked = blocked.some(b =>
      b.type === 'user' && b.target_id === interaction.user.id
    );
    if (isBlocked) {
      await interaction.reply({ content: `${emojis.error} You are blocked from using modmail.`, flags: MessageFlags.Ephemeral });
      return;
    }

    if (blocked.some(b => b.type === 'role' && interaction.member.roles.cache.has(b.target_id))) {
      await interaction.reply({ content: `${emojis.error} Your role is blocked from using modmail.`, flags: MessageFlags.Ephemeral });
      return;
    }

    const existing = db.query(
      "SELECT id FROM modmail_tickets WHERE guild_id = ? AND user_id = ? AND status = 'open'"
    ).get(interaction.guildId, interaction.user.id);
    if (existing) {
      await interaction.reply({ content: `${emojis.warning} You already have an open ticket. Please wait for staff to respond.`, flags: MessageFlags.Ephemeral });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('modmail_modal')
      .setTitle('Modmail Ticket');

    const messageInput = new TextInputBuilder()
      .setCustomId('modmail_message')
      .setLabel('What do you need help with?')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Describe your issue or question in detail...')
      .setMinLength(10)
      .setMaxLength(2000)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(messageInput));

    await interaction.showModal(modal);
    return;
  }

  /* ─── MODMAIL MODAL SUBMISSION ─── */
  if (interaction.isModalSubmit() && interaction.customId === 'modmail_modal') {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const msg = interaction.fields.getTextInputValue('modmail_message');
    const db = getDb('modmail');
    const config = db.query('SELECT * FROM modmail_config WHERE guild_id = ?').get(interaction.guildId);
    if (!config) {
      await interaction.editReply({ content: 'Modmail is not configured.' });
      return;
    }

    const logChannel = interaction.guild.channels.cache.get(config.log_channel_id);
    if (!logChannel) {
      await interaction.editReply({ content: 'Modmail log channel not found. Contact an administrator.' });
      return;
    }

     const result = db.run(
       "INSERT INTO modmail_tickets (guild_id, user_id, message, status) VALUES (?, ?, ?, 'open')",
       [interaction.guildId, interaction.user.id, msg]
     );
    const ticketId = result.lastInsertRowid;

    const staffRoles = db.query('SELECT role_id FROM modmail_roles WHERE guild_id = ?').all(interaction.guildId);

    const overwrites = [
      { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...staffRoles.map(r => ({
        id: r.role_id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      })),
    ];

    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: overwrites,
      reason: `Modmail ticket #${ticketId} from ${interaction.user.tag}`,
    });

    const welcomeEmbed = new EmbedBuilder()
      .setTitle(`${emojis.modmail} Modmail Ticket`)
      .setColor(0x2B2D31)
      .setDescription(
        `Welcome to your modmail ticket!\n\n` +
        `**Your message:**\n${msg}\n\n` +
        `Staff will respond here. Please describe your issue in detail.`
      )
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setFooter({ text: `Ticket #${ticketId}` })
      .setTimestamp();

    const closeBtn = new ButtonBuilder()
      .setCustomId(`modmail_close|${ticketId}`)
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒');

    await ticketChannel.send({ embeds: [welcomeEmbed], components: [new ActionRowBuilder().addComponents(closeBtn)] });

    const logEmbed = new EmbedBuilder()
      .setTitle(`${emojis.modmail} New Modmail Ticket`)
      .setColor(0x2B2D31)
      .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'From', value: `${interaction.user.tag} (\`${interaction.user.id}\`)`, inline: true },
        { name: 'Ticket', value: `#${ticketId}`, inline: true },
        { name: 'Channel', value: `<#${ticketChannel.id}>`, inline: true },
        { name: 'Message', value: msg, inline: false },
      )
      .setTimestamp();

    const solveBtn = new ButtonBuilder()
      .setCustomId(`modmail_solve|${ticketId}`)
      .setLabel('Mark as Solved')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅');

    const dismissBtn = new ButtonBuilder()
      .setCustomId(`modmail_dismiss|${ticketId}`)
      .setLabel('Dismiss')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('❌');

    await logChannel.send({ embeds: [logEmbed], components: [new ActionRowBuilder().addComponents(solveBtn, dismissBtn)] });

     db.run('UPDATE modmail_tickets SET thread_id = ? WHERE id = ?', [ticketChannel.id, ticketId]);

    await interaction.editReply({
      content: `${emojis.success} Your modmail ticket has been created! Staff will respond in <#${ticketChannel.id}>.`,
    });
    return;
  }

  /* ─── MODMAIL CLOSE BUTTON ─── */
  if (interaction.isButton() && interaction.customId.startsWith('modmail_close|')) {
    const ticketId = parseInt(interaction.customId.split('|')[1], 10);
    const db = getDb('modmail');
    const ticket = db.query('SELECT * FROM modmail_tickets WHERE id = ?').get(ticketId);

    if (!ticket || ticket.guild_id !== interaction.guildId) {
      await interaction.reply({ content: `${emojis.error} Ticket not found.`, flags: MessageFlags.Ephemeral });
      return;
    }

    if (ticket.status !== 'open') {
      await interaction.reply({ content: `${emojis.warning} This ticket is already ${ticket.status}.`, flags: MessageFlags.Ephemeral });
      return;
    }

    const isStaff = interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) || interaction.user.id === ticket.user_id;
    if (!isStaff) {
      await interaction.reply({ content: `${emojis.error} You do not have permission to close this ticket.`, flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferUpdate();

    db.run("UPDATE modmail_tickets SET status = 'closed' WHERE id = ?", [ticketId]);

    try {
      const user = await client.users.fetch(ticket.user_id);
      const dmEmbed = new EmbedBuilder()
        .setTitle(`${emojis.dismissed} Ticket Closed`)
        .setDescription(
          `Your modmail ticket in **${interaction.guild.name}** has been closed.\n\n` +
          `If you need further assistance, feel free to open a new ticket.`
        )
        .setColor(0xED4245)
        .setTimestamp();
      await user.send({ embeds: [dmEmbed] });
    } catch {}

    const ticketChannel = interaction.guild.channels.cache.get(ticket.thread_id);
    if (ticketChannel) {
      await ticketChannel.permissionOverwrites.delete(ticket.user_id).catch(() => {});
      await ticketChannel.send({ content: `${emojis.dismissed} Ticket closed by ${interaction.user.tag}. Deleting in 3 seconds...` });
      setTimeout(() => ticketChannel.delete('Ticket closed').catch(() => {}), 3000);
    }

    await interaction.editReply({ components: [] });
    await interaction.followUp({ content: `${emojis.solved} Ticket #${ticketId} closed.`, flags: MessageFlags.Ephemeral });
    return;
  }

  /* ─── MODMAIL SOLVE / DISMISS BUTTONS ─── */
  if (interaction.isButton() && (interaction.customId.startsWith('modmail_solve|') || interaction.customId.startsWith('modmail_dismiss|'))) {
    const [action, ticketIdStr] = interaction.customId.split('|');
    const ticketId = parseInt(ticketIdStr, 10);
    const db = getDb('modmail');
    const ticket = db.query('SELECT * FROM modmail_tickets WHERE id = ?').get(ticketId);

    if (!ticket || ticket.guild_id !== interaction.guildId) {
      await interaction.reply({ content: `${emojis.error} Ticket not found.`, flags: MessageFlags.Ephemeral });
      return;
    }

    if (ticket.status !== 'open') {
      await interaction.reply({ content: `${emojis.warning} This ticket is already ${ticket.status}.`, flags: MessageFlags.Ephemeral });
      return;
    }

    const isStaff = interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);
    if (!isStaff) {
      await interaction.reply({ content: `${emojis.error} You do not have permission to manage tickets.`, flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferUpdate();

    if (action === 'modmail_solve') {
      db.run("UPDATE modmail_tickets SET status = 'solved' WHERE id = ?", [ticketId]);

      const solvedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(0x57F287)
        .setFooter({ text: `Solved by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

      await interaction.editReply({ embeds: [solvedEmbed], components: [] });
      await interaction.followUp({ content: `${emojis.solved} Ticket #${ticketId} marked as solved.`, flags: MessageFlags.Ephemeral });

      try {
        const user = await client.users.fetch(ticket.user_id);
        const dmEmbed = new EmbedBuilder()
          .setTitle(`${emojis.solved} Ticket Solved`)
          .setDescription(
            `Your modmail ticket in **${interaction.guild.name}** has been marked as **solved**.\n\n` +
            `If you need further assistance, feel free to open a new ticket.`
          )
          .setColor(0x57F287)
          .setTimestamp();
        await user.send({ embeds: [dmEmbed] });
      } catch {}

      const ticketChannel = interaction.guild.channels.cache.get(ticket.thread_id);
      if (ticketChannel) {
        await ticketChannel.permissionOverwrites.delete(ticket.user_id).catch(() => {});
        await ticketChannel.send({ content: `${emojis.solved} Ticket solved by ${interaction.user.tag}. Deleting in 3 seconds...` });
        setTimeout(() => ticketChannel.delete('Ticket solved').catch(() => {}), 3000);
      }

    } else if (action === 'modmail_dismiss') {
      db.run("UPDATE modmail_tickets SET status = 'dismissed' WHERE id = ?", [ticketId]);

      const dismissedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(0xED4245)
        .setFooter({ text: `Dismissed by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

      await interaction.editReply({ embeds: [dismissedEmbed], components: [] });
      await interaction.followUp({ content: `${emojis.dismissed} Ticket #${ticketId} dismissed.`, flags: MessageFlags.Ephemeral });

      try {
        const user = await client.users.fetch(ticket.user_id);
        const dmEmbed = new EmbedBuilder()
          .setTitle(`${emojis.dismissed} Ticket Dismissed`)
          .setDescription(
            `Your modmail ticket in **${interaction.guild.name}** has been **dismissed**.\n\n` +
            `If you still need assistance, please open a new ticket.`
          )
          .setColor(0xED4245)
          .setTimestamp();
        await user.send({ embeds: [dmEmbed] });
      } catch {}

      const ticketChannel = interaction.guild.channels.cache.get(ticket.thread_id);
      if (ticketChannel) {
        await ticketChannel.permissionOverwrites.delete(ticket.user_id).catch(() => {});
        await ticketChannel.send({ content: `${emojis.dismissed} Ticket dismissed by ${interaction.user.tag}. Deleting in 3 seconds...` });
        setTimeout(() => ticketChannel.delete('Ticket dismissed').catch(() => {}), 3000);
      }
    }
    return;
  }
}
