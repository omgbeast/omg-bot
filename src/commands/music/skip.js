import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),
  cooldown: 3,

  async execute(interaction) {
    await interaction.reply('Music will be available when deployed to Railway!');
  }
};
