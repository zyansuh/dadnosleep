export function buildDiscordAuthorizeUrl(): string {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string | undefined;
  const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI as string | undefined;
  if (!clientId || !redirectUri) {
    throw new Error('Discord 로그인이 설정되지 않았습니다. 운영 담당자에게 문의해 주세요.');
  }
  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'identify',
  });
  return `https://discord.com/api/oauth2/authorize?${params}`;
}
