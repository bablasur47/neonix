import { Events, MessageFlags } from 'discord.js';
import log from '../../util/console.js';
import { checkRatelimit } from '../../util/ratelimit.js';

export const name = Events.InteractionCreate;

export async function execute(interaction, client) {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.slashCommands.get(interaction.commandName);
  if (!cmd) {
    await interaction.reply({ content: 'Command not found.', flags: MessageFlags.Ephemeral });
    return;
  }

  const cooldown = checkRatelimit(interaction.user.id, interaction.commandName);
  if (cooldown > 0) {
    await interaction.reply({ content: `Please wait ${cooldown}s before using this command again.`, flags: MessageFlags.Ephemeral });
    return;
  }

  try {
    await cmd.execute(interaction, client);
  } catch (err) {
    log.error(`Slash command ${interaction.commandName}`, err);
    const reply = interaction.deferred || interaction.replied
      ? interaction.followUp.bind(interaction)
      : interaction.reply.bind(interaction);

    await reply({ content: 'An error occurred while executing that command.', flags: MessageFlags.Ephemeral });
  }
}
