import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('hideall')
  .setDescription('Hide all channels from @everyone')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  await interaction.deferReply();

  const channels = interaction.guild.channels.cache.filter(c =>
    c.permissionsFor(c.guild.roles.everyone).has('ViewChannel')
  );

  if (!channels.size) {
    await interaction.editReply(`${emojis.info} No visible channels to hide.`);
    return;
  }

  let done = 0;
  for (const ch of channels.values()) {
    try {
      await ch.permissionOverwrites.edit(ch.guild.roles.everyone, { ViewChannel: false });
      done++;
    } catch {}
  }

  await interaction.editReply(`${emojis.success} Hidden ${done}/${channels.size} channels.`);
}
