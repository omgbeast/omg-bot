import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music and clear queue'),
  cooldown: 3,

  async execute(interaction) {
    await interaction.reply('Music will be available when deployed to Railway!');
  }
};
