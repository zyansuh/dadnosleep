const DEFAULT_ADMIN_DISCORD_USERS = ['1000hyehyang1', 'sweet__rain'];

function parseList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

function getAdminDiscordUsernames(): string[] {
  const fromEnv = parseList(
    process.env.ADMIN_DISCORD_USERS
    ?? process.env.VITE_ADMIN_DISCORD_USERS,
  );
  if (fromEnv.length > 0) return fromEnv;
  return [...DEFAULT_ADMIN_DISCORD_USERS];
}

export function isAdminDiscordUsername(username: string): boolean {
  const key = username.trim().toLowerCase();
  return getAdminDiscordUsernames().some(u => u.toLowerCase() === key);
}
