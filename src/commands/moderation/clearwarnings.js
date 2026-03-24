import { SlashCommandBuilder } from 'discord.js';
import { clearWarnings } from '../../features/moderation/moderationManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription('Clear a user\'s warnings')
    .addUserOption(opt => opt.setName('user').setDescription('User to clear warnings for').setRequired(true)),
  cooldown: 5,
  requiredPermissions: ['ManageMessages'],

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    clearWarnings(user.id, interaction.guild.id);
    interaction.reply(`Cleared all warnings for ${user}.`);
  }
};
