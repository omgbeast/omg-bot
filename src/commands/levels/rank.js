import { SlashCommandBuilder } from 'discord.js';
import { getUserRank, getXPForLevel } from '../../features/levels/levelManager.js';
import { get } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your or another user\'s rank and level')
    .addUserOption(opt => opt.setName('user').setDescription('User to check (default: yourself)')),
  cooldown: 5,

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const row = get('SELECT * FROM user_xp WHERE user_id = ? AND guild_id = ?', user.id, interaction.guild.id);

    if (!row) {
      return interaction.reply(`${user.username} hasn't earned any XP yet!`);
    }

    const rank = getUserRank(interaction.guild.id, user.id);
    const xpForNextLevel = getXPForLevel(row.level + 1);
    const progress = Math.floor((row.xp / xpForNextLevel) * 100);

    const embed = {
      color: 0x00AE86,
      title: `${user.username}'s Rank`,
      fields: [
        { name: 'Level', value: `${row.level}`, inline: true },
        { name: 'Rank', value: `#${rank || '?'}`, inline: true },
        { name: 'XP', value: `${row.xp} / ${xpForNextLevel}`, inline: true },
        { name: 'Messages', value: `${row.messages_count}`, inline: true },
        { name: 'Progress', value: `${progress}%`, inline: true },
      ],
      thumbnail: { url: user.displayAvatarURL() },
    };

    interaction.reply({ embeds: [embed] });
  }
};
