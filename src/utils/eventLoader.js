import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadEvents(client) {
  const eventsPath = join(__dirname, '../events');
  const eventFiles = readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    import(pathToFileURL(filePath).href).then(event => {
      const evt = event.default || event;
      if (evt.once) {
        client.once(evt.name, (...args) => evt.execute(...args, client));
      } else {
        client.on(evt.name, (...args) => evt.execute(...args, client));
      }
      console.log(`Loaded event: ${evt.name}`);
    });
  }
}
