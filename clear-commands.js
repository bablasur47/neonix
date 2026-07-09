import { REST, Routes } from 'discord.js';
import config from './util/config.js';

const rest = new REST({ version: '10' }).setToken(config.token);

try {
  console.log('Fetching existing commands...');

  const commands = await rest.get(Routes.applicationCommands(config.clientId));
  console.log(`Found ${commands.length} commands.`);

  if (commands.length === 0) {
    console.log('No commands to delete.');
    process.exit(0);
  }

  console.log('Clearing all global slash commands...');
  await rest.put(Routes.applicationCommands(config.clientId), { body: [] });
  console.log('Successfully cleared all global slash commands.');
} catch (err) {
  console.error('Error clearing commands:', err);
  process.exit(1);
}
