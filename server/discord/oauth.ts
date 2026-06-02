export interface DiscordOAuthUser {
  id:           string;
  username:     string;
  global_name?: string | null;
  avatar?:      string | null;
}

function env(primary: string, ...fallbacks: string[]): string {
  const keys = [primary, ...fallbacks];
  for (const key of keys) {
    const raw = process.env[key];
    if (raw?.trim()) return raw.trim();
  }
  throw new Error(`${primary} is not configured (checked: ${keys.join(', ')})`);
}

export async function exchangeDiscordCode(code: string): Promise<DiscordOAuthUser> {
  const clientId     = env('DISCORD_CLIENT_ID', 'VITE_DISCORD_CLIENT_ID');
  const clientSecret = env('DISCORD_CLIENT_SECRET', 'VITE_DISCORD_CLIENT_SECRET');
  const redirectUri  = env('DISCORD_REDIRECT_URI', 'VITE_DISCORD_REDIRECT_URI');

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Discord token exchange failed: ${tokenRes.status} ${err}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenData.access_token;
  if (!accessToken) throw new Error('Discord token response missing access_token');

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    const err = await userRes.text();
    throw new Error(`Discord user fetch failed: ${userRes.status} ${err}`);
  }

  const user = (await userRes.json()) as {
    id?: string;
    username?: string;
    global_name?: string | null;
    avatar?: string | null;
  };

  if (!user.id || !user.username) {
    throw new Error('Discord user response missing id or username');
  }

  return {
    id:           user.id,
    username:     user.username,
    global_name:  user.global_name ?? null,
    avatar:       user.avatar ?? null,
  };
}
