import { SlashCommandBuilder } from 'discord.js';
import Spotify from 'spotify-web-api-node';
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice';
import ytdl from '@distube/ytdl-core';

const spotify = new Spotify({
  clientId: process.env.SPOTIFY_CLIENT_ID || '9395f0bbe78b4f8698375861ff9d2026',
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '50f63028fdec402c9b2e8909923b1a22',
});

let player = null;
let queue = [];

async function getSpotifyTrack(query) {
  try {
    const data = await spotify.clientCredentialsGrant();
    spotify.setAccessToken(data.body.access_token);

    if (query.includes('open.spotify.com')) {
      // Spotify URL
      const track = await spotify.getTrack(query.split('/').pop().split('?')[0]);
      return {
        title: track.body.name,
        artist: track.body.artists[0].name,
        thumbnail: track.body.album.images[0]?.url,
        searchQuery: `${track.body.name} ${track.body.artists[0].name}`,
      };
    } else {
      // Search query
      const result = await spotify.searchTracks(query, { limit: 1 });
      if (result.body.tracks.items.length === 0) return null;
      const track = result.body.tracks.items[0];
      return {
        title: track.name,
        artist: track.artists[0].name,
        thumbnail: track.album.images[0]?.url,
        searchQuery: `${track.name} ${track.artists[0].name}`,
      };
    }
  } catch (error) {
    console.error('Spotify error:', error.message);
    return null;
  }
}

async function searchYouTube(query) {
  try {
    const searchQuery = encodeURIComponent(query);
    const url = `https://www.youtube.com/results?search_query=${searchQuery}`;

    // Use ytdl-core to search
    const info = await ytdl.getInfo(`ytsearch:${query}`);
    return info.videoDetails.videoId;
  } catch (error) {
    console.error('YouTube search error:', error.message);
    return null;
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube or Spotify')
    .addStringOption(opt => opt.setName('query').setDescription('Song name, URL, or Spotify link').setRequired(true)),
  cooldown: 5,

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply('You need to be in a voice channel!');
    }

    await interaction.deferReply();

    // Get track info from Spotify
    const trackInfo = await getSpotifyTrack(query);
    if (!trackInfo) {
      return interaction.editReply('Could not find that track!');
    }

    // Try to get YouTube URL
    await interaction.editReply(`Found: **${trackInfo.title}** by ${trackInfo.artist}. Searching YouTube...`);

    let videoId;
    try {
      const result = await ytdl.getInfo(`ytsearch:${trackInfo.searchQuery}`);
      videoId = result.videoDetails.videoId;
    } catch {
      return interaction.editReply('Could not find on YouTube!');
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Join voice channel and play
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    try {
      const stream = ytdl(youtubeUrl, { filter: 'audioonly', quality: 'highestaudio' });
      const resource = createAudioResource(stream);

      player = createAudioPlayer();
      player.play(resource);
      connection.subscribe(player);

      await interaction.editReply(`Now playing: **${trackInfo.title}** by ${trackInfo.artist}`);
    } catch (error) {
      console.error('Playback error:', error);
      await interaction.editReply('Error playing the song!');
    }
  }
};
