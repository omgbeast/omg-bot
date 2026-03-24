import { get, all, run } from '../../database/db.js';

export function loadModeration(client) {
  console.log('Moderation system loaded');
}

export async function checkBlacklist(message) {
  const words = all('SELECT word FROM blacklisted_words WHERE guild_id = ?', message.guild.id);
  if (!words.length) return;

  const content = message.content.toLowerCase();
  const blacklisted = words.find(w => content.includes(w.word.toLowerCase()));

  if (blacklisted) {
    await message.delete().catch(() => {});
    message.channel.send(`${message.author}, that word is not allowed!`).then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 3000);
    });
  }
}

export function addBlacklistWord(guildId, word) {
  run('INSERT OR IGNORE INTO blacklisted_words (guild_id, word) VALUES (?, ?)', guildId, word.toLowerCase());
}

export function removeBlacklistWord(guildId, word) {
  run('DELETE FROM blacklisted_words WHERE guild_id = ? AND word = ?', guildId, word.toLowerCase());
}

export function getBlacklistWords(guildId) {
  return all('SELECT word FROM blacklisted_words WHERE guild_id = ?', guildId);
}

export function addWarning(userId, guildId, moderatorId, reason) {
  run('INSERT INTO warnings (user_id, guild_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?)',
    userId, guildId, moderatorId, reason, Date.now());
}

export function getWarnings(userId, guildId) {
  return all('SELECT * FROM warnings WHERE user_id = ? AND guild_id = ? ORDER BY timestamp DESC', userId, guildId);
}

export function clearWarnings(userId, guildId) {
  run('DELETE FROM warnings WHERE user_id = ? AND guild_id = ?', userId, guildId);
}

export function logModerationAction(guildId, userId, action, moderatorId, reason) {
  run('INSERT INTO mod_logs (guild_id, user_id, action, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    guildId, userId, action, moderatorId, reason, Date.now());
}
