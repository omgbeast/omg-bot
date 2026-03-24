import { SlashCommandBuilder } from 'discord.js';
import { logModerationAction } from '../../features/moderation/moderationManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for ban'))
    .addIntegerOption(opt => opt.setName('days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7)),
  cooldown: 5,
  requiredPermissions: ['BanMembers'],

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('days') || 0;

    await interaction.guild.bans.create(user.id, { deleteMessageDays: deleteDays, reason }).catch(() => {});
    logModerationAction(interaction.guild.id, user.id, 'BAN', interaction.user.id, reason);

    const embed = {
      color: 0xFF0000,
      title: 'User Banned',
      description: `${user} was banned.\n**Reason:** ${reason}`,
      timestamp: new Date().toISOString(),
    };

    interaction.reply({ embeds: [embed] });
  }
};
