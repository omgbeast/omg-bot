import { SlashCommandBuilder } from 'discord.js';
import { getWarnings, clearWarnings } from '../../features/moderation/moderationManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Check a user\'s warnings')
    .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(true)),
  cooldown: 5,
  requiredPermissions: ['ManageMessages'],

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const warns = getWarnings(user.id, interaction.guild.id);

    if (!warns.length) {
      return interaction.reply(`${user} has no warnings.`);
    }

    const fields = warns.slice(0, 5).map(w => ({
      name: `Warning #${w.id}`,
      value: `${w.reason}\n<t:${Math.floor(w.timestamp / 1000)}:R>`,
      inline: false,
    }));

    const embed = {
      color: 0xFFAA00,
      title: `${user.username}'s Warnings`,
      description: `Total: ${warns.length}`,
      fields,
    };

    interaction.reply({ embeds: [embed] });
  }
};
