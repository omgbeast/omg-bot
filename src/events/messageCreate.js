import { Events } from 'discord.js';

export default {
  name: Events.MessageCreate,
  once: false,
  async execute(message, client) {
    if (message.author.bot) return;

    // XP system
    const { addXP } = await import('../features/levels/levelManager.js');
    addXP(message);

    // Word filter
    const { checkBlacklist } = await import('../features/moderation/moderationManager.js');
    checkBlacklist(message);
  }
};
