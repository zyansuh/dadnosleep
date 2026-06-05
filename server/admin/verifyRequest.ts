import type { IncomingMessage } from 'node:http';
import { verifyDiscordAdminToken } from './discordAdminJwt';
import { verifyPasswordAdminToken } from './passwordAdminJwt';

export type AdminAuthKind = 'discord_admin' | 'password_admin';

export interface AdminAuthResult {
  ok:       true;
  kind:     AdminAuthKind;
  username?: string;
}

export interface AdminAuthFailure {
  ok:      false;
  status:  number;
  message: string;
}

export type VerifyAdminResult = AdminAuthResult | AdminAuthFailure;

function getBearer(req: IncomingMessage): string | null {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return null;
  return h.slice(7).trim();
}

export async function verifyAdminRequest(
  req: IncomingMessage,
): Promise<VerifyAdminResult> {
  const token = getBearer(req);
  if (!token) {
    return { ok: false, status: 401, message: '관리자 인증이 필요합니다.' };
  }

  const discord = await verifyDiscordAdminToken(token);
  if (discord) {
    return { ok: true, kind: 'discord_admin', username: discord.username };
  }

  const password = await verifyPasswordAdminToken(token);
  if (password) {
    return { ok: true, kind: 'password_admin' };
  }

  return { ok: false, status: 403, message: '관리자 권한이 없습니다.' };
}

export function verifyAdminPasswordInput(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
    ?? process.env.VITE_ADMIN_PASSWORD
    ?? '';
  if (!expected) return false;
  return input === expected;
}
