import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function deployCommands() {
  const commands = [];
  const commandFolders = readdirSync(join(__dirname, './commands'));

  for (const folder of commandFolders) {
    const folderPath = join(__dirname, './commands', folder);
    const commandFiles = readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = join(folderPath, file);
      const command = await import(pathToFileURL(filePath).href).then(m => m.default);
      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log(`Registering ${commands.length} commands...`);
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('Commands registered successfully!');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
}

deployCommands();
