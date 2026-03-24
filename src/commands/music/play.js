import { SlashCommandBuilder } from 'discord.js';
import { Manager } from 'erela.js';

let manager = null;

function getManager(client) {
  if (!manager) {
    manager = new Manager({
      nodes: [
        {
          host: 'localhost',
          port: 2333,
          password: 'youshallnotpass',
        },
      ],
      send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
    });

    manager.on('nodeReady', () => console.log('Lavalink ready'));
    manager.connect();
  }
  return manager;
}

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube')
    .addStringOption(opt => opt.setName('query').setDescription('Song name or URL').setRequired(true)),
  cooldown: 5,

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply('You need to be in a voice channel!');
    }

    await interaction.deferReply();

    const m = getManager(interaction.client);
    const isUrl = query.includes('youtube.com') || query.includes('youtu.be');

    try {
      const result = await m.search(isUrl ? query : `ytsearch:${query}`, interaction.user);
      if (!result.tracks.length) {
        return interaction.editReply('No results found!');
      }

      let player = m.players.get(interaction.guild.id);
      if (!player) {
        player = m.createPlayer({
          guildId: interaction.guild.id,
          voiceChannel: voiceChannel.id,
          textChannel: interaction.channel.id,
        });
      }

      player.queue.add(result.tracks[0]);
      if (!player.playing) player.play();

      await interaction.editReply(`Added **${result.tracks[0].title}** to queue`);
    } catch (error) {
      console.error('Play error:', error);
      await interaction.editReply('Error playing track!');
    }
  }
};
