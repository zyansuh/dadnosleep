import { SignJWT, jwtVerify } from 'jose';

const EXPIRY = '12h';

export interface PasswordAdminPayload {
  kind: 'password_admin';
}

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
    ?? process.env.VITE_JWT_SECRET
    ?? 'dadnosleep-dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

export async function signPasswordAdminToken(): Promise<string> {
  return new SignJWT({ kind: 'password_admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secretKey());
}

export async function verifyPasswordAdminToken(
  token: string,
): Promise<PasswordAdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== 'password_admin') return null;
    return { kind: 'password_admin' };
  } catch {
    return null;
  }
}
