import { Events } from 'discord.js';

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member, client) {
    const { applyAutoRoles } = await import('../features/autoroles/autoRoleManager.js');
    const { sendWelcome } = await import('../features/welcome/welcomeManager.js');
    applyAutoRoles(member);
    sendWelcome(member);
  }
};
