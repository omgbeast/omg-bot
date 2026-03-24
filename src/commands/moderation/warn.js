import { SlashCommandBuilder } from 'discord.js';
import { addWarning, getWarnings, clearWarnings, logModerationAction } from '../../features/moderation/moderationManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for warning')),
  cooldown: 5,
  requiredPermissions: ['ManageMessages'],

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    addWarning(user.id, interaction.guild.id, interaction.user.id, reason);
    logModerationAction(interaction.guild.id, user.id, 'WARN', interaction.user.id, reason);

    const warns = getWarnings(user.id, interaction.guild.id);
    const warnCount = warns.length;

    const embed = {
      color: 0xFFAA00,
      title: 'User Warned',
      description: `${user} has been warned.\n**Reason:** ${reason}\n**Total warnings:** ${warnCount}`,
      timestamp: new Date().toISOString(),
    };

    interaction.reply({ embeds: [embed] });

    // Send DM to user
    user.send({ embeds: [{ color: 0xFFAA00, title: 'Warning', description: `You were warned in ${interaction.guild.name}.\n**Reason:** ${reason}` }] }).catch(() => {});
  }
};
