import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube')
    .addStringOption(opt => opt.setName('query').setDescription('Song name or URL').setRequired(true)),
  cooldown: 5,

  async execute(interaction) {
    await interaction.reply('Music will be available when deployed to Railway. For now, deploy your bot to Railway where YouTube streaming works automatically!');
  }
};
