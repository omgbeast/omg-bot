import { Events } from 'discord.js';

export default {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member, client) {
    const { sendGoodbye } = await import('../features/welcome/welcomeManager.js');
    sendGoodbye(member);
  }
};
