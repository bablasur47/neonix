import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('role')
  .setDescription('Manage roles')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addSubcommand(sub =>
    sub.setName('create').setDescription('Create a new role')
      .addStringOption(opt => opt.setName('name').setDescription('Role name').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('delete').setDescription('Delete a role')
      .addRoleOption(opt => opt.setName('role').setDescription('Role to delete').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('rename').setDescription('Rename a role')
      .addRoleOption(opt => opt.setName('role').setDescription('Role to rename').setRequired(true))
      .addStringOption(opt => opt.setName('name').setDescription('New name').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('add').setDescription('Add a role to a user')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('remove').setDescription('Remove a role from a user')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('all').setDescription('Give a role to all members')
      .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('bots').setDescription('Give a role to all bots')
      .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('humans').setDescription('Give a role to all humans')
      .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('status').setDescription('View role info')
      .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true)));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'create') {
    const name = interaction.options.getString('name', true);
    try {
      const role = await interaction.guild.roles.create({ name, reason: `Created by ${interaction.user.tag}` });
      await interaction.reply(`${emojis.success} Role **${role.name}** created.`);
    } catch (err) {
      await interaction.reply({ content: `${emojis.error} ${err.message}`, flags: MessageFlags.Ephemeral });
    }
    return;
  }

  if (sub === 'delete') {
    const role = interaction.options.getRole('role', true);
    try {
      await role.delete(`Deleted by ${interaction.user.tag}`);
      await interaction.reply(`${emojis.success} Role deleted.`);
    } catch (err) {
      await interaction.reply({ content: `${emojis.error} ${err.message}`, flags: MessageFlags.Ephemeral });
    }
    return;
  }

  if (sub === 'rename') {
    const role = interaction.options.getRole('role', true);
    const name = interaction.options.getString('name', true);
    try {
      await role.setName(name);
      await interaction.reply(`${emojis.success} Role renamed to **${name}**`);
    } catch (err) {
      await interaction.reply({ content: `${emojis.error} ${err.message}`, flags: MessageFlags.Ephemeral });
    }
    return;
  }

  if (sub === 'add') {
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role', true);
    if (!member) {
      await interaction.reply({ content: `${emojis.error} User not found.`, flags: MessageFlags.Ephemeral });
      return;
    }
    try {
      await member.roles.add(role);
      await interaction.reply(`${emojis.success} Added **${role.name}** to **${member.user.tag}**`);
    } catch (err) {
      await interaction.reply({ content: `${emojis.error} ${err.message}`, flags: MessageFlags.Ephemeral });
    }
    return;
  }

  if (sub === 'remove') {
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role', true);
    if (!member) {
      await interaction.reply({ content: `${emojis.error} User not found.`, flags: MessageFlags.Ephemeral });
      return;
    }
    try {
      await member.roles.remove(role);
      await interaction.reply(`${emojis.success} Removed **${role.name}** from **${member.user.tag}**`);
    } catch (err) {
      await interaction.reply({ content: `${emojis.error} ${err.message}`, flags: MessageFlags.Ephemeral });
    }
    return;
  }

  if (sub === 'all') {
    await interaction.deferReply();
    const role = interaction.options.getRole('role', true);
    let count = 0;
    for (const member of interaction.guild.members.cache.values()) {
      if (!member.roles.cache.has(role.id)) {
        try { await member.roles.add(role.id); count++; } catch {}
      }
    }
    await interaction.editReply(`${emojis.success} Added **${role.name}** to ${count} members.`);
    return;
  }

  if (sub === 'bots') {
    await interaction.deferReply();
    const role = interaction.options.getRole('role', true);
    let count = 0;
    for (const member of interaction.guild.members.cache.filter(m => m.user.bot).values()) {
      if (!member.roles.cache.has(role.id)) {
        try { await member.roles.add(role.id); count++; } catch {}
      }
    }
    await interaction.editReply(`${emojis.success} Added **${role.name}** to ${count} bots.`);
    return;
  }

  if (sub === 'humans') {
    await interaction.deferReply();
    const role = interaction.options.getRole('role', true);
    let count = 0;
    for (const member of interaction.guild.members.cache.filter(m => !m.user.bot).values()) {
      if (!member.roles.cache.has(role.id)) {
        try { await member.roles.add(role.id); count++; } catch {}
      }
    }
    await interaction.editReply(`${emojis.success} Added **${role.name}** to ${count} humans.`);
    return;
  }

  if (sub === 'status') {
    const role = interaction.options.getRole('role', true);
    await interaction.reply(
      `${emojis.info} **${role.name}**\nID: \`${role.id}\`\nColor: ${role.hexColor}\nMembers: ${role.members.size}\nPosition: ${role.position}\nHoisted: ${role.hoist}\nMentionable: ${role.mentionable}`
    );
    return;
  }
}
