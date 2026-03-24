import { get, run } from '../../database/db.js';

export function loadAutoRoles(client) {
  console.log('Auto roles system loaded');
}

export async function applyAutoRoles(member) {
  const settings = get('SELECT auto_roles FROM guild_settings WHERE guild_id = ?', member.guild.id);
  if (!settings || !settings.auto_roles) return;

  const roles = JSON.parse(settings.auto_roles);
  for (const roleId of roles) {
    const role = member.guild.roles.cache.get(roleId);
    if (role) {
      await member.roles.add(role).catch(() => {});
    }
  }
}

export function addAutoRole(guildId, roleId) {
  const settings = get('SELECT auto_roles FROM guild_settings WHERE guild_id = ?', guildId);
  let roles = settings?.auto_roles ? JSON.parse(settings.auto_roles) : [];
  if (!roles.includes(roleId)) {
    roles.push(roleId);
  }
  run(`
    INSERT INTO guild_settings (guild_id, auto_roles)
    VALUES (?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET auto_roles = excluded.auto_roles
  `, guildId, JSON.stringify(roles));
}

export function removeAutoRole(guildId, roleId) {
  const settings = get('SELECT auto_roles FROM guild_settings WHERE guild_id = ?', guildId);
  if (!settings?.auto_roles) return;

  let roles = JSON.parse(settings.auto_roles);
  roles = roles.filter(r => r !== roleId);

  run(`
    INSERT INTO guild_settings (guild_id, auto_roles)
    VALUES (?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET auto_roles = excluded.auto_roles
  `, guildId, JSON.stringify(roles));
}

export function getAutoRoles(guildId) {
  const settings = get('SELECT auto_roles FROM guild_settings WHERE guild_id = ?', guildId);
  return settings?.auto_roles ? JSON.parse(settings.auto_roles) : [];
}
