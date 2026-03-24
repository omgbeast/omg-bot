import { SlashCommandBuilder } from 'discord.js';
import { setWelcomeSettings } from '../../features/welcome/welcomeManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure welcome messages')
    .addSubcommand(sub => sub.setName('setup').setDescription('Set up welcome channel and message')
      .addChannelOption(opt => opt.setName('channel').setDescription('Welcome channel').setRequired(true))
      .addStringOption(opt => opt.setName('message').setDescription('Welcome message ({user}, {username}, {server}, {membercount})').setRequired(true)))
    .addSubcommand(sub => sub.setName('disable').setDescription('Disable welcome messages')),
  cooldown: 5,
  requiredPermissions: ['ManageGuild'],

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'setup') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message');

      setWelcomeSettings(interaction.guild.id, channel.id, message, true);
      interaction.reply(`Welcome messages enabled in ${channel}.`);
    } else if (sub === 'disable') {
      setWelcomeSettings(interaction.guild.id, null, null, false);
      interaction.reply('Welcome messages disabled.');
    }
  }
};
