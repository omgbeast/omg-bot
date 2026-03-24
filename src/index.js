import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { initDatabase } from './database/db.js';
import { loadCommands } from './utils/commandLoader.js';
import { loadEvents } from './utils/eventLoader.js';
import { loadLevels } from './features/levels/levelManager.js';
import { loadModeration } from './features/moderation/moderationManager.js';
import { loadWelcome } from './features/welcome/welcomeManager.js';
import { loadAutoRoles } from './features/autoroles/autoRoleManager.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'MEMBER'],
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Initialize database and start bot
async function start() {
  await initDatabase();

  // Load all components
  loadCommands(client);
  loadEvents(client);
  loadLevels(client);
  loadModeration(client);
  loadWelcome(client);
  loadAutoRoles(client);

  client.login(process.env.DISCORD_TOKEN);
}

start();
