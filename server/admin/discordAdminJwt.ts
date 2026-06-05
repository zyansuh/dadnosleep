import { SignJWT, jwtVerify } from 'jose';

const EXPIRY = '12h';

export interface DiscordAdminPayload {
  kind:     'discord_admin';
  username: string;
  discordId: string;
}

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
    ?? process.env.VITE_JWT_SECRET
    ?? 'dadnosleep-dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

export async function signDiscordAdminToken(
  discordId: string,
  username: string,
): Promise<string> {
  return new SignJWT({ kind: 'discord_admin', username, discordId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secretKey());
}

export async function verifyDiscordAdminToken(
  token: string,
): Promise<DiscordAdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== 'discord_admin') return null;
    if (!payload.username || !payload.discordId) return null;
    return {
      kind:      'discord_admin',
      username:  String(payload.username),
      discordId: String(payload.discordId),
    };
  } catch {
    return null;
  }
}
