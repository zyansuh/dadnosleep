import { jwtVerify } from 'jose';

function jwtSecret() {
  return process.env.JWT_SECRET
    ?? process.env.VITE_JWT_SECRET
    ?? 'dadnosleep-dev-secret-change-in-production';
}

function getBinKey() {
  const raw = process.env.JSONBIN_ACCESS_KEY
    ?? process.env.VITE_JSONBIN_ACCESS_KEY
    ?? '';
  return raw.replace(/^["']|["']$/g, '').trim();
}

function getBinId() {
  return (process.env.JSONBIN_BIN_ID
    ?? process.env.VITE_JSONBIN_BIN_ID
    ?? '').trim();
}

function classifyStatus(status) {
  if (status === 401) return '저장소 접근에 실패했습니다.';
  if (status === 404) return '저장소를 찾을 수 없습니다.';
  return '저장에 실패했습니다.';
}

async function fetchBinRecord() {
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

async function patchBinRecord(patch) {
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

async function verifyAdmin(req) {
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
      return { ok: false, status: 403, message: '관리자 권한이 없습니다.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, status: 403, message: '관리자 권한이 없습니다.' };
  }
}

function parseSchedule(raw) {
  if (!raw || typeof raw !== 'object') return {};
  return raw;
}

/** @param {import('@vercel/node').VercelRequest} req */
/** @param {import('@vercel/node').VercelResponse} res */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyAdmin(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.message });
  }

  try {
    const record = await fetchBinRecord();
    const prev = parseSchedule(record.schedule);
    await patchBinRecord({
      schedule: {
        ...prev,
        isPublished: false,
        published:   null,
        publishedAt: null,
      },
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : '편성표 비공개 처리에 실패했습니다.';
    return res.status(500).json({ error: message });
  }
}
