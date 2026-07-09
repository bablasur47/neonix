import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('unhideall')
  .setDescription('Unhide all channels from @everyone')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  await interaction.deferReply();

  const channels = interaction.guild.channels.cache.filter(c =>
    c.permissionOverwrites.cache.some(o =>
      o.id === c.guild.roles.everyone.id && !o.allow.has('ViewChannel')
    )
  );

  if (!channels.size) {
    await interaction.editReply(`${emojis.info} No hidden channels found.`);
    return;
  }

  let done = 0;
  for (const ch of channels.values()) {
    try {
      await ch.permissionOverwrites.edit(ch.guild.roles.everyone, { ViewChannel: null });
      done++;
    } catch {}
  }

  await interaction.editReply(`${emojis.success} Unhidden ${done}/${channels.size} channels.`);
}
