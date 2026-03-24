import { SlashCommandBuilder } from 'discord.js';
import { setGoodbyeSettings } from '../../features/welcome/welcomeManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('goodbye')
    .setDescription('Configure goodbye messages')
    .addSubcommand(sub => sub.setName('setup').setDescription('Set up goodbye channel and message')
      .addChannelOption(opt => opt.setName('channel').setDescription('Goodbye channel').setRequired(true))
      .addStringOption(opt => opt.setName('message').setDescription('Goodbye message ({user}, {username}, {server}, {membercount})').setRequired(true)))
    .addSubcommand(sub => sub.setName('disable').setDescription('Disable goodbye messages')),
  cooldown: 5,
  requiredPermissions: ['ManageGuild'],

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'setup') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message');

      setGoodbyeSettings(interaction.guild.id, channel.id, message, true);
      interaction.reply(`Goodbye messages enabled in ${channel}.`);
    } else if (sub === 'disable') {
      setGoodbyeSettings(interaction.guild.id, null, null, false);
      interaction.reply('Goodbye messages disabled.');
    }
  }
};
