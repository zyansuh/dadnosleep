export function buildDiscordAuthorizeUrl(): string {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string | undefined;
  const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI as string | undefined;
  if (!clientId || !redirectUri) {
    throw new Error('VITE_DISCORD_CLIENT_ID 또는 VITE_DISCORD_REDIRECT_URI가 설정되지 않았습니다.');
  }
  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'identify',
  });
  return `https://discord.com/api/oauth2/authorize?${params}`;
}
