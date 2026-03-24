import { SlashCommandBuilder } from 'discord.js';
import { getLeaderboard } from '../../features/levels/levelManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the server\'s XP leaderboard')
    .addIntegerOption(opt => opt.setName('page').setDescription('Page number').setMinValue(1)),
  cooldown: 10,

  async execute(interaction) {
    const leaderboard = getLeaderboard(interaction.guild.id, 10);

    if (!leaderboard.length) {
      return interaction.reply('No XP data yet!');
    }

    const fields = await Promise.all(leaderboard.map(async (row, i) => {
      const user = await interaction.guild.members.fetch(row.user_id).catch(() => null);
      const name = user?.user?.username || `Unknown (${row.user_id})`;
      return {
        name: `#${i + 1} ${name}`,
        value: `Level ${row.level} • ${row.xp} XP • ${row.messages_count} msgs`,
        inline: false,
      };
    }));

    const embed = {
      color: 0xFFD700,
      title: `${interaction.guild.name} Leaderboard`,
      fields,
      timestamp: new Date().toISOString(),
    };

    interaction.reply({ embeds: [embed] });
  }
};
