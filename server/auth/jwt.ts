import { SignJWT, jwtVerify } from 'jose';
import type { JwtPayload, PublicUser } from './types';

const EXPIRY = '7d';

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET || 'dadnosleep-dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

export async function signToken(user: PublicUser): Promise<string> {
  return new SignJWT({ id: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secretKey());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.id || !payload.email || !payload.role) return null;
    return {
      id:    String(payload.id),
      email: String(payload.email),
      role:  payload.role as JwtPayload['role'],
    };
  } catch {
    return null;
  }
}
