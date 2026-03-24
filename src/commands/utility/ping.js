import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),
  cooldown: 10,

  async execute(interaction) {
    const ping = Date.now() - interaction.createdTimestamp;
    interaction.reply(`Pong! Latency: ${ping}ms`);
  }
};
