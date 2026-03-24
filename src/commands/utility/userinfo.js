import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get info about a user')
    .addUserOption(opt => opt.setName('user').setDescription('User to get info about')),
  cooldown: 5,

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Info`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'Username', value: user.tag, inline: true },
        { name: 'ID', value: user.id, inline: true },
        { name: 'Joined Server', value: member?.joinedAt?.toLocaleDateString() || 'Unknown', inline: true },
        { name: 'Account Created', value: user.createdAt.toLocaleDateString(), inline: true },
        { name: 'Roles', value: member?.roles.cache.size > 1 ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).join(', ') || 'None' : 'None', inline: false },
      )
      .setColor(member?.displayHexColor || 'Default');

    interaction.reply({ embeds: [embed] });
  }
};
