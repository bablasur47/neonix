import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('lockall')
  .setDescription('Lock all text channels')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  await interaction.deferReply();

  const channels = interaction.guild.channels.cache.filter(c =>
    c.type === ChannelType.GuildText && c.permissionsFor(c.guild.roles.everyone).has('SendMessages')
  );

  if (!channels.size) {
    await interaction.editReply(`${emojis.info} No channels to lock.`);
    return;
  }

  let done = 0;
  for (const ch of channels.values()) {
    try {
      await ch.permissionOverwrites.edit(ch.guild.roles.everyone, { SendMessages: false });
      done++;
    } catch {}
  }

  await interaction.editReply(`${emojis.success} Locked ${done}/${channels.size} channels.`);
}
