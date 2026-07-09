import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('unbanall')
  .setDescription('Unban all users from the server')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  await interaction.deferReply();

  const bans = await interaction.guild.bans.fetch().catch(() => null);
  if (!bans?.size) {
    await interaction.editReply(`${emojis.info} No bans to remove.`);
    return;
  }

  let done = 0;
  for (const ban of bans.values()) {
    try {
      await interaction.guild.members.unban(ban.user.id);
      done++;
    } catch {}
  }

  await interaction.editReply(`${emojis.success} Unbanned ${done}/${bans.size} users.`);
}
