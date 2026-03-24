import { get, run } from '../../database/db.js';

export function loadWelcome(client) {
  console.log('Welcome system loaded');
}

export async function sendWelcome(member) {
  const settings = get('SELECT * FROM guild_settings WHERE guild_id = ?', member.guild.id);
  if (!settings || !settings.welcome_enabled || !settings.welcome_channel_id) return;

  const channel = member.guild.channels.cache.get(settings.welcome_channel_id);
  if (!channel) return;

  const message = settings.welcome_message
    .replace('{user}', member.user.toString())
    .replace('{username}', member.user.username)
    .replace('{server}', member.guild.name)
    .replace('{membercount}', member.guild.memberCount);

  const embed = {
    color: 0x00AE86,
    title: 'Welcome!',
    description: message,
    thumbnail: { url: member.user.displayAvatarURL() },
    timestamp: new Date().toISOString(),
    footer: { text: `Member #${member.guild.memberCount}` },
  };

  channel.send({ embeds: [embed] }).catch(() => {});
}

export async function sendGoodbye(member) {
  const settings = get('SELECT * FROM guild_settings WHERE guild_id = ?', member.guild.id);
  if (!settings || !settings.goodbye_enabled || !settings.goodbye_channel_id) return;

  const channel = member.guild.channels.cache.get(settings.goodbye_channel_id);
  if (!channel) return;

  const message = settings.goodbye_message
    .replace('{user}', member.user.toString())
    .replace('{username}', member.user.username)
    .replace('{server}', member.guild.name)
    .replace('{membercount}', member.guild.memberCount);

  const embed = {
    color: 0xFF0000,
    title: 'Goodbye!',
    description: message,
    timestamp: new Date().toISOString(),
  };

  channel.send({ embeds: [embed] }).catch(() => {});
}

export function setWelcomeSettings(guildId, channelId, message, enabled) {
  run(`
    INSERT INTO guild_settings (guild_id, welcome_channel_id, welcome_message, welcome_enabled)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET
      welcome_channel_id = excluded.welcome_channel_id,
      welcome_message = excluded.welcome_message,
      welcome_enabled = excluded.welcome_enabled
  `, guildId, channelId, message, enabled ? 1 : 0);
}

export function setGoodbyeSettings(guildId, channelId, message, enabled) {
  run(`
    INSERT INTO guild_settings (guild_id, goodbye_channel_id, goodbye_message, goodbye_enabled)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET
      goodbye_channel_id = excluded.goodbye_channel_id,
      goodbye_message = excluded.goodbye_message,
      goodbye_enabled = excluded.goodbye_enabled
  `, guildId, channelId, message, enabled ? 1 : 0);
}
