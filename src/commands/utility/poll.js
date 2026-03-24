import { SlashCommandBuilder } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption(opt => opt.setName('question').setDescription('Poll question').setRequired(true))
    .addStringOption(opt => opt.setName('options').setDescription('Options separated by | (e.g. "Yes|No|Maybe")').setRequired(true))
    .addIntegerOption(opt => opt.setName('duration').setDescription('Duration in minutes').setMinValue(1).setMaxValue(10080)),
  cooldown: 5,

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = interaction.options.getString('options').split('|').map(o => o.trim()).filter(o => o);
    const duration = interaction.options.getInteger('duration');

    if (options.length < 2 || options.length > 9) {
      return interaction.reply('Please provide 2-9 options separated by |');
    }

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    const embed = new EmbedBuilder()
      .setTitle('📊 Poll')
      .setDescription(`**${question}**\n\n${options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n')}`)
      .setColor(0x00AE86)
      .setFooter({ text: duration ? `Ends in ${duration} minutes` : 'No end time' })
      .setTimestamp(duration ? new Date(Date.now() + duration * 60000) : null);

    const pollMessage = await interaction.reply({ embeds: [embed.fetch()] });
    pollMessage = await interaction.fetchReply();

    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(emojis[i]);
    }

    if (duration) {
      setTimeout(async () => {
        const fetched = await pollMessage.fetch();
        const reactions = fetched.reactions.cache;

        const results = options.map((opt, i) => {
          const count = reactions.get(emojis[i])?.count - 1 || 0;
          return { option: opt, votes: count };
        }).sort((a, b) => b.votes - a.votes);

        const resultEmbed = new EmbedBuilder()
          .setTitle('📊 Poll Results')
          .setDescription(`**${question}**\n\n${results.map(r => `${r.option}: **${r.votes} votes**`).join('\n')}`)
          .setColor(0xFFD700)
          .setTimestamp();

        await interaction.editReply({ embeds: [resultEmbed] });
      }, duration * 60000);
    }
  }
};
