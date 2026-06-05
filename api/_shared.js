import { jwtVerify } from 'jose';

const DEFAULT_ADMIN_DISCORD_USERS = ['1000hyehyang1', 'sweet__rain'];

export function jwtSecret() {
  return process.env.JWT_SECRET
    ?? process.env.VITE_JWT_SECRET
    ?? 'dadnosleep-dev-secret-change-in-production';
}

export function getBinKey() {
  const raw = process.env.JSONBIN_ACCESS_KEY
    ?? process.env.VITE_JSONBIN_ACCESS_KEY
    ?? '';
  return raw.replace(/^["']|["']$/g, '').trim();
}

export function getBinId() {
  return (process.env.JSONBIN_BIN_ID
    ?? process.env.VITE_JSONBIN_BIN_ID
    ?? '').trim();
}

function classifyStatus(status) {
  if (status === 401) return '저장소 접근에 실패했습니다.';
  if (status === 404) return '저장소를 찾을 수 없습니다.';
  return '저장에 실패했습니다.';
}

export async function fetchBinRecord() {
  const key = getBinKey();
  const binId = getBinId();
  if (!key || !binId) throw new Error('JSONBin이 설정되지 않았습니다.');

  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: { 'X-Access-Key': key },
  });
  if (!res.ok) throw new Error(classifyStatus(res.status));
  const json = await res.json();
  return json.record ?? {};
}

export async function patchBinRecord(patch) {
  const existing = await fetchBinRecord();
  const next = { ...existing, ...patch };
  const key = getBinKey();
  const binId = getBinId();

  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
    method:  'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': key,
    },
    body: JSON.stringify(next),
  });
  if (!res.ok) throw new Error(classifyStatus(res.status));
  return next;
}

export function readBody(req) {
  const { body } = req;
  if (body === undefined || body === null || body === '') {
    throw new Error('Missing request body');
  }
  return typeof body === 'string' ? JSON.parse(body) : body;
}

export async function verifyAdmin(req) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) {
    return { ok: false, status: 401, message: '관리자 인증이 필요합니다. Discord 관리자로 로그인해 주세요.' };
  }

  try {
    const { payload } = await jwtVerify(
      h.slice(7).trim(),
      new TextEncoder().encode(jwtSecret()),
    );
    if (payload.kind !== 'discord_admin') {
      return { ok: false, status: 403, message: '관리자 권한이 없습니다. Discord 관리자 계정으로 로그인해 주세요.' };
    }
    return { ok: true, username: String(payload.username) };
  } catch {
    return { ok: false, status: 403, message: '관리자 권한이 없습니다. Discord 관리자 계정으로 로그인해 주세요.' };
  }
}
