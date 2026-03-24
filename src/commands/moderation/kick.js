import { SlashCommandBuilder } from 'discord.js';
import { logModerationAction } from '../../features/moderation/moderationManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(opt => opt.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for kick')),
  cooldown: 5,
  requiredPermissions: ['KickMembers'],

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member) {
      return interaction.reply('User not found in this server.');
    }

    if (!member.kickable) {
      return interaction.reply('I cannot kick this user.');
    }

    await member.kick(reason);
    logModerationAction(interaction.guild.id, user.id, 'KICK', interaction.user.id, reason);

    const embed = {
      color: 0xFF0000,
      title: 'User Kicked',
      description: `${user} was kicked.\n**Reason:** ${reason}`,
      timestamp: new Date().toISOString(),
    };

    interaction.reply({ embeds: [embed] });
  }
};
