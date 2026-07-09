import { Events, MessageFlags } from 'discord.js';
import { getDb } from '../../database/index.js';
import log from '../../util/console.js';

export const name = Events.InteractionCreate;

export async function execute(interaction) {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'giveaway_enter') return;

  try {
    const gDb = getDb('giveaways');
    const msgId = interaction.message.id;

    // Check if giveaway exists and is still active
    const giveaway = gDb.query('SELECT * FROM giveaways WHERE message_id = ? AND guild_id = ? AND ended = 0').get(msgId, interaction.guildId);
    if (!giveaway) {
      await interaction.reply({ content: '❌ This giveaway is no longer active.', flags: MessageFlags.Ephemeral });
      return;
    }

    // Check if the user is already entered
    const existing = gDb.query('SELECT * FROM giveaway_entries WHERE message_id = ? AND user_id = ?').get(msgId, interaction.user.id);
    if (existing) {
      await interaction.reply({ content: '✅ You are already entered in this giveaway!', flags: MessageFlags.Ephemeral });
      return;
    }

    // Check if user has required role (if set)
    if (giveaway.required_role && giveaway.bypass_role) {
      const hasRequired = interaction.member.roles.cache.has(giveaway.required_role);
      const hasBypass = interaction.member.roles.cache.has(giveaway.bypass_role);
      if (!hasRequired && !hasBypass) {
        await interaction.reply({
          content: `❌ You must have <@&${giveaway.required_role}> or <@&${giveaway.bypass_role}> to enter.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
    } else if (giveaway.required_role) {
      if (!interaction.member.roles.cache.has(giveaway.required_role)) {
        await interaction.reply({
          content: `❌ You must have <@&${giveaway.required_role}> to enter.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
    } else if (giveaway.bypass_role) {
      if (!interaction.member.roles.cache.has(giveaway.bypass_role)) {
        await interaction.reply({
          content: `❌ You must have <@&${giveaway.bypass_role}> to enter.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
    }

    // Add user to giveaway entries
    gDb.run('INSERT INTO giveaway_entries (message_id, user_id, guild_id) VALUES (?, ?, ?)', [msgId, interaction.user.id, interaction.guildId]);

    await interaction.reply({ content: '🎉 You have been entered into the giveaway!', flags: MessageFlags.Ephemeral });
  } catch (err) {
    log.error('Giveaway button interaction', err);
    await interaction.reply({ content: '❌ An error occurred while entering the giveaway.', flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}
