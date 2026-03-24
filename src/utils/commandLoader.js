import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadCommands(client) {
  const commandsPath = join(__dirname, '../commands');
  const commandFolders = readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = join(commandsPath, folder);
    const commandFiles = readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = join(folderPath, file);
      import(pathToFileURL(filePath).href).then(command => {
        const cmd = command.default || command;
        if (cmd.data && cmd.execute) {
          client.commands.set(cmd.data.name, cmd);
          console.log(`Loaded command: ${cmd.data.name}`);
        }
      });
    }
  }
}
