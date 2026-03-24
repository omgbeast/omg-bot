import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = process.env.DB_PATH || join(__dirname, '../../data/bot.json');

// Ensure directory exists
try {
  mkdirSync(dirname(dbPath), { recursive: true });
} catch {}

let data = {
  guild_settings: {},
  user_xp: {},
  level_roles: {},
  warnings: [],
  mod_logs: [],
  blacklisted_words: {},
  disabled_commands: {}
};

export async function initDatabase() {
  if (existsSync(dbPath)) {
    try {
      const fileContent = readFileSync(dbPath, 'utf-8');
      data = JSON.parse(fileContent);
    } catch {
      data = { guild_settings: {}, user_xp: {}, level_roles: {}, warnings: [], mod_logs: [], blacklisted_words: {}, disabled_commands: {} };
    }
  }
  saveDb();
  console.log('Database initialized');
}

export function saveDb() {
  writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export function getDb() {
  return data;
}

// Helper: get single row
export function get(sql, ...params) {
  const [table, conditions] = parseTableConditions(sql);
  const rows = all(sql, ...params);
  return rows[0] || null;
}

// Helper: get all rows
export function all(sql, ...params) {
  const [table, conditions] = parseTableConditions(sql);

  switch (table) {
    case 'guild_settings': {
      if (conditions.guild_id) {
        const row = data.guild_settings[conditions.guild_id];
        return row ? [row] : [];
      }
      return Object.values(data.guild_settings);
    }
    case 'user_xp': {
      const guildId = params[0];
      const userId = params[1];
      if (userId && guildId) {
        const key = `${guildId}_${userId}`;
        const row = data.user_xp[key];
        return row ? [row] : [];
      }
      if (guildId) {
        return Object.values(data.user_xp).filter(r => r.guild_id === guildId);
      }
      return Object.values(data.user_xp);
    }
    case 'level_roles': {
      const guildId = params[0];
      if (guildId) {
        return Object.values(data.level_roles).filter(r => r.guild_id === guildId);
      }
      return Object.values(data.level_roles);
    }
    case 'warnings': {
      const userId = params[0];
      const guildId = params[1];
      return data.warnings.filter(w =>
        (!userId || w.user_id === userId) && (!guildId || w.guild_id === guildId)
      ).sort((a, b) => b.timestamp - a.timestamp);
    }
    case 'mod_logs': {
      return data.mod_logs;
    }
    case 'blacklisted_words': {
      const guildId = params[0];
      if (guildId) {
        return (data.blacklisted_words[guildId] || []).map(word => ({ word }));
      }
      return [];
    }
    case 'disabled_commands': {
      return [];
    }
    default:
      return [];
  }
}

// Helper: run INSERT/UPDATE/DELETE
export function run(sql, ...params) {
  const sqlLower = sql.toLowerCase().trim();

  if (sqlLower.startsWith('insert')) {
    handleInsert(sql, params);
  } else if (sqlLower.startsWith('update')) {
    handleUpdate(sql, params);
  } else if (sqlLower.startsWith('delete')) {
    handleDelete(sql, params);
  }

  saveDb();
}

function parseTableConditions(sql) {
  const match = sql.match(/from\s+(\w+)(?:\s+where\s+(.+))?/i);
  const table = match ? match[1] : '';
  const conditions = {};

  if (match && match[2]) {
    const conditionMatches = match[2].matchAll(/(\w+)\s*=\s*\?/g);
    for (const m of conditionMatches) {
      conditions[m[1]] = true;
    }
  }

  return [table, conditions];
}

function handleInsert(sql, params) {
  const sqlLower = sql.toLowerCase();

  if (sqlLower.includes('guild_settings')) {
    const [guild_id, welcome_channel_id, welcome_message, welcome_enabled,
           goodbye_channel_id, goodbye_message, goodbye_enabled, log_channel_id, log_enabled, muted_role_id, auto_roles] = params;

    if (sqlLower.includes('on conflict')) {
      // UPSERT
      if (!data.guild_settings[guild_id]) {
        data.guild_settings[guild_id] = { guild_id };
      }
      if (welcome_channel_id !== undefined) data.guild_settings[guild_id].welcome_channel_id = welcome_channel_id;
      if (welcome_message !== undefined) data.guild_settings[guild_id].welcome_message = welcome_message;
      if (welcome_enabled !== undefined) data.guild_settings[guild_id].welcome_enabled = welcome_enabled;
      if (goodbye_channel_id !== undefined) data.guild_settings[guild_id].goodbye_channel_id = goodbye_channel_id;
      if (goodbye_message !== undefined) data.guild_settings[guild_id].goodbye_message = goodbye_message;
      if (goodbye_enabled !== undefined) data.guild_settings[guild_id].goodbye_enabled = goodbye_enabled;
      if (log_channel_id !== undefined) data.guild_settings[guild_id].log_channel_id = log_channel_id;
      if (log_enabled !== undefined) data.guild_settings[guild_id].log_enabled = log_enabled;
      if (muted_role_id !== undefined) data.guild_settings[guild_id].muted_role_id = muted_role_id;
      if (auto_roles !== undefined) data.guild_settings[guild_id].auto_roles = auto_roles;
    } else {
      data.guild_settings[guild_id] = {
        guild_id,
        welcome_channel_id: welcome_channel_id || null,
        welcome_message: welcome_message || null,
        welcome_enabled: welcome_enabled || 0,
        goodbye_channel_id: goodbye_channel_id || null,
        goodbye_message: goodbye_message || null,
        goodbye_enabled: goodbye_enabled || 0,
        log_channel_id: log_channel_id || null,
        log_enabled: log_enabled || 0,
        muted_role_id: muted_role_id || null,
        auto_roles: auto_roles || '[]'
      };
    }
  }

  else if (sqlLower.includes('user_xp')) {
    const [user_id, guild_id, xp, level, messages_count, last_message] = params;
    const key = `${guild_id}_${user_id}`;
    data.user_xp[key] = { user_id, guild_id, xp, level, messages_count, last_message };
  }

  else if (sqlLower.includes('warnings')) {
    const [user_id, guild_id, moderator_id, reason, timestamp] = params;
    const id = data.warnings.length > 0 ? Math.max(...data.warnings.map(w => w.id)) + 1 : 1;
    data.warnings.push({ id, user_id, guild_id, moderator_id, reason, timestamp });
  }

  else if (sqlLower.includes('mod_logs')) {
    const [guild_id, user_id, action, moderator_id, reason, timestamp] = params;
    const id = data.mod_logs.length > 0 ? Math.max(...data.mod_logs.map(l => l.id)) + 1 : 1;
    data.mod_logs.push({ id, guild_id, user_id, action, moderator_id, reason, timestamp });
  }

  else if (sqlLower.includes('blacklisted_words')) {
    const [guild_id, word] = params;
    if (!data.blacklisted_words[guild_id]) {
      data.blacklisted_words[guild_id] = [];
    }
    if (!data.blacklisted_words[guild_id].includes(word)) {
      data.blacklisted_words[guild_id].push(word);
    }
  }
}

function handleUpdate(sql, params) {
  const sqlLower = sql.toLowerCase();

  if (sqlLower.includes('user_xp')) {
    const [xp, level, messages_count, last_message, user_id, guild_id] = params;
    const key = `${guild_id}_${user_id}`;
    if (data.user_xp[key]) {
      data.user_xp[key].xp = xp;
      data.user_xp[key].level = level;
      data.user_xp[key].messages_count = messages_count;
      data.user_xp[key].last_message = last_message;
    }
  }
}

function handleDelete(sql, params) {
  const sqlLower = sql.toLowerCase();

  if (sqlLower.includes('warnings')) {
    const [user_id, guild_id] = params;
    data.warnings = data.warnings.filter(w => !(w.user_id === user_id && w.guild_id === guild_id));
  }

  else if (sqlLower.includes('blacklisted_words')) {
    const [guild_id, word] = params;
    if (data.blacklisted_words[guild_id]) {
      data.blacklisted_words[guild_id] = data.blacklisted_words[guild_id].filter(w => w !== word);
    }
  }
}
