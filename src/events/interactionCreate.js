export default {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Check cooldown
    const cooldowns = client.cooldowns;
    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Map());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldown = 3 * 1000; // 3 seconds

    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id) + (command.cooldown || defaultCooldown);
      if (now < expirationTime) {
        const remaining = Math.ceil((expirationTime - now) / 1000);
        return interaction.reply({ content: `Slow down! Wait ${remaining}s before using \`${command.data.name}\` again.`, ephemeral: true });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), command.cooldown || defaultCooldown);

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`Error executing ${command.data.name}:`, error);
      const content = 'There was an error executing that command.';
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content, ephemeral: true });
      } else {
        await interaction.reply({ content, ephemeral: true });
      }
    }
  }
};
