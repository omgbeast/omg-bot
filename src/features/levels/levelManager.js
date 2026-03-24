import { get, all, run } from '../../database/db.js';

const XP_PER_MESSAGE = 15;
const COOLDOWN_MS = 30000; // 30s between XP gains

export function loadLevels(client) {
  console.log('Level system loaded');
}

export function addXP(message) {
  const { user_id, guild_id } = { user_id: message.author.id, guild_id: message.guild.id };

  // Check cooldown
  const row = get('SELECT last_message FROM user_xp WHERE user_id = ? AND guild_id = ?', user_id, guild_id);
  if (row && Date.now() - row.last_message < COOLDOWN_MS) return;

  // Add XP
  const current = get('SELECT * FROM user_xp WHERE user_id = ? AND guild_id = ?', user_id, guild_id);
  if (current) {
    const newXP = current.xp + XP_PER_MESSAGE;
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > current.level;

    run('UPDATE user_xp SET xp = ?, level = ?, messages_count = messages_count + 1, last_message = ? WHERE user_id = ? AND guild_id = ?',
      newXP, newLevel, Date.now(), user_id, guild_id);

    if (leveledUp) {
      handleLevelUp(message, newLevel);
    }
  } else {
    run('INSERT INTO user_xp (user_id, guild_id, xp, level, messages_count, last_message) VALUES (?, ?, ?, ?, 1, ?)',
      user_id, guild_id, XP_PER_MESSAGE, 0, Date.now());
  }
}

export function calculateLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100));
}

export function getXPForLevel(level) {
  return level * level * 100;
}

export function getUserRank(guildId, userId) {
  const users = all('SELECT * FROM user_xp WHERE guild_id = ? ORDER BY xp DESC', guildId);
  const index = users.findIndex(u => u.user_id === userId);
  return index >= 0 ? index + 1 : null;
}

export function getLeaderboard(guildId, limit = 10) {
  return all('SELECT * FROM user_xp WHERE guild_id = ? ORDER BY xp DESC LIMIT ?', guildId, limit);
}

async function handleLevelUp(message, newLevel) {
  const levelRole = get('SELECT role_id FROM level_roles WHERE guild_id = ? AND level = ?', message.guild.id, newLevel);

  if (levelRole) {
    const role = message.guild.roles.cache.get(levelRole.role_id);
    if (role) {
      await message.member.roles.add(role).catch(() => {});
    }
  }

  const embed = {
    color: 0x00AE86,
    title: 'Level Up!',
    description: `Congratulations ${message.author}! You've reached level **${newLevel}**!`,
    timestamp: new Date().toISOString(),
  };

  message.channel.send({ embeds: [embed] }).catch(() => {});
}
