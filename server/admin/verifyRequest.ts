import type { IncomingMessage } from 'node:http';
import { verifyDiscordAdminToken } from './discordAdminJwt';

export type AdminAuthKind = 'discord_admin';

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
    return { ok: false, status: 401, message: '관리자 인증이 필요합니다. Discord 관리자로 로그인해 주세요.' };
  }

  const discord = await verifyDiscordAdminToken(token);
  if (discord) {
    return { ok: true, kind: 'discord_admin', username: discord.username };
  }

  return { ok: false, status: 403, message: '관리자 권한이 없습니다. Discord 관리자 계정으로 로그인해 주세요.' };
}
