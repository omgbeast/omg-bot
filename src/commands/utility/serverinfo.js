import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get info about the server'),
  cooldown: 5,

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle(`${guild.name} Info`)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Owner', value: (await guild.fetchOwner()).user.tag, inline: true },
        { name: 'Created', value: guild.createdAt.toLocaleDateString(), inline: true },
        { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true },
      )
      .setColor(0x00AE86);

    interaction.reply({ embeds: [embed] });
  }
};
