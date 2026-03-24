import { SlashCommandBuilder } from 'discord.js';
import { addBlacklistWord, removeBlacklistWord, getBlacklistWords } from '../../features/moderation/moderationManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage blacklisted words')
    .addSubcommand(sub => sub.setName('add').setDescription('Add a word to blacklist').addStringOption(opt => opt.setName('word').setDescription('Word to blacklist').setRequired(true)))
    .addSubcommand(sub => sub.setName('remove').setDescription('Remove a word from blacklist').addStringOption(opt => opt.setName('word').setDescription('Word to remove').setRequired(true)))
    .addSubcommand(sub => sub.setName('list').setDescription('List all blacklisted words')),
  cooldown: 5,
  requiredPermissions: ['ManageMessages'],

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const word = interaction.options.getString('word');
      addBlacklistWord(interaction.guild.id, word);
      interaction.reply(`Added **${word}** to the blacklist.`);
    } else if (sub === 'remove') {
      const word = interaction.options.getString('word');
      removeBlacklistWord(interaction.guild.id, word);
      interaction.reply(`Removed **${word}** from the blacklist.`);
    } else if (sub === 'list') {
      const words = getBlacklistWords(interaction.guild.id);
      if (!words.length) return interaction.reply('No blacklisted words.');
      interaction.reply(`**Blacklisted words:** ${words.map(w => w.word).join(', ')}`);
    }
  }
};
