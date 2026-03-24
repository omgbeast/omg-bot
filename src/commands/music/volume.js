import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Adjust volume (0-100)')
    .addIntegerOption(opt => opt.setName('level').setDescription('Volume level').setMinValue(0).setMaxValue(100).setRequired(true)),
  cooldown: 3,

  async execute(interaction) {
    await interaction.reply('Music will be available when deployed to Railway!');
  }
};
