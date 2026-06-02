function env(primary, ...fallbacks) {
  const keys = [primary, ...fallbacks];
  for (const key of keys) {
    const raw = process.env[key];
    if (raw?.trim()) return raw.trim();
  }
  throw new Error(`${primary} is not configured (checked: ${keys.join(', ')})`);
}

async function exchangeDiscordCode(code) {
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

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) throw new Error('Discord token response missing access_token');

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    const err = await userRes.text();
    throw new Error(`Discord user fetch failed: ${userRes.status} ${err}`);
  }

  const user = await userRes.json();
  if (!user.id || !user.username) {
    throw new Error('Discord user response missing id or username');
  }

  return {
    id:          user.id,
    username:    user.username,
    global_name: user.global_name ?? null,
    avatar:      user.avatar ?? null,
  };
}

/** @param {import('@vercel/node').VercelRequest} req */
/** @param {import('@vercel/node').VercelResponse} res */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const code = req.body?.code;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    const user = await exchangeDiscordCode(code);
    return res.status(200).json({
      id:          user.id,
      username:    user.username,
      global_name: user.global_name,
      avatar:      user.avatar,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Discord OAuth failed';
    console.error('[discord-callback]', message);
    return res.status(500).json({ error: message });
  }
}
