import { Manager } from 'erela.js';
import { EmbedBuilder } from 'discord.js';

let manager = null;

export function initManager(client) {
  if (manager) return manager;

  manager = new Manager({
    nodes: [
      {
        host: process.env.LAVALINK_HOST || 'localhost',
        port: parseInt(process.env.LAVALINK_PORT) || 2333,
        password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
      },
    ],
    send: (id, payload) => {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    },
  });

  // Connect to nodes
  manager.connect();

  manager.on('nodeReady', (node) => {
    console.log(`Lavalink node ${node.options.host} ready!`);
  });

  manager.on('nodeError', (node, err) => {
    console.error(`Lavalink node ${node.options.host} error:`, err);
  });

  manager.on('trackStart', (player, track) => {
    const channel = client.channels.cache.get(player.textChannel);
    if (channel) {
      channel.send({ embeds: [{
        title: 'Now Playing',
        description: `[${track.title}](${track.uri})`,
        color: 0x00AE86,
      }]});
    }
  });

  manager.on('queueEnd', (player) => {
    const channel = client.channels.cache.get(player.textChannel);
    if (channel) channel.send('Queue ended!');
    player.destroy();
  });

  return manager;
}

export function getManager() {
  return manager;
}
