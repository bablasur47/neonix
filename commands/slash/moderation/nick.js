import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('nick')
  .setDescription("Change a user's nickname")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
  .addUserOption(opt => opt.setName('user').setDescription('User to change nickname').setRequired(true))
  .addStringOption(opt => opt.setName('nickname').setDescription('New nickname').setRequired(true));

export async function execute(interaction) {
  const member = interaction.options.getMember('user');
  const nick = interaction.options.getString('nickname', true);

  if (!member) {
    await interaction.reply({ content: `${emojis.error} User not found.`, flags: MessageFlags.Ephemeral });
    return;
  }

  try {
    await member.setNickname(nick, `By ${interaction.user.tag}`);
    await interaction.reply(`${emojis.success} Changed **${member.user.tag}**'s nickname to **${nick}**`);
  } catch (err) {
    await interaction.reply({ content: `${emojis.error} Failed to change nickname: ${err.message}`, flags: MessageFlags.Ephemeral });
  }
}
