import { SlashCommandBuilder } from 'discord.js';
import { addAutoRole, removeAutoRole, getAutoRoles } from '../../features/autoroles/autoRoleManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Manage auto roles')
    .addSubcommand(sub => sub.setName('add').setDescription('Add an auto role').addRoleOption(opt => opt.setName('role').setDescription('Role to add').setRequired(true)))
    .addSubcommand(sub => sub.setName('remove').setDescription('Remove an auto role').addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true)))
    .addSubcommand(sub => sub.setName('list').setDescription('List auto roles')),
  cooldown: 5,
  requiredPermissions: ['ManageRoles'],

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const role = interaction.options.getRole('role');
      addAutoRole(interaction.guild.id, role.id);
      interaction.reply(`Auto role ${role} added. New members will receive it.`);
    } else if (sub === 'remove') {
      const role = interaction.options.getRole('role');
      removeAutoRole(interaction.guild.id, role.id);
      interaction.reply(`Auto role ${role} removed.`);
    } else if (sub === 'list') {
      const roles = getAutoRoles(interaction.guild.id);
      if (!roles.length) return interaction.reply('No auto roles configured.');

      const roleNames = roles.map(id => {
        const role = interaction.guild.roles.cache.get(id);
        return role ? role.toString() : `<@&${id}>`;
      });

      interaction.reply(`**Auto roles:** ${roleNames.join(', ')}`);
    }
  }
};
