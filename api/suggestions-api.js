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

function readBody(req) {
  const { body } = req;
  if (body === undefined || body === null || body === '') {
    throw new Error('Missing request body');
  }
  return typeof body === 'string' ? JSON.parse(body) : body;
}

const VALID_STATUS = new Set(['pending', 'reviewing', 'answered', 'closed']);

function normalizeList(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(item =>
    item
    && typeof item.id === 'string'
    && typeof item.title === 'string'
    && typeof item.nick === 'string'
    && typeof item.createdAt === 'string',
  ).map(item => ({
    ...item,
    status: VALID_STATUS.has(item.status) ? item.status : 'pending',
  }));
}

/** @param {import('@vercel/node').VercelRequest} req */
/** @param {import('@vercel/node').VercelResponse} res */
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const record = await fetchBinRecord();
      return res.status(200).json({ ok: true, suggestions: normalizeList(record.suggestions) });
    } catch (e) {
      const message = e instanceof Error ? e.message : '건의함을 불러오지 못했습니다.';
      console.error('[suggestions-api]', message);
      return res.status(500).json({ error: message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = readBody(req);
      const title = body.title?.trim() ?? '';
      const category = body.category?.trim() ?? '';
      const time = body.time?.trim() ?? '';
      const desc = body.desc?.trim() ?? '';
      const nick = body.nick?.trim() ?? '';

      if (!title || !category || !time || !desc || !nick) {
        return res.status(400).json({ error: '필수 항목을 모두 입력해 주세요.' });
      }

      const record = await fetchBinRecord();
      const list = normalizeList(record.suggestions);
      const item = {
        id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        category,
        time,
        desc,
        nick,
        createdAt: new Date().toISOString(),
        status:    'pending',
        replies:   [],
      };

      await patchBinRecord({ suggestions: [item, ...list] });
      return res.status(201).json({ ok: true, suggestion: item });
    } catch (e) {
      const message = e instanceof Error ? e.message : '건의 등록에 실패했습니다.';
      console.error('[suggestions-api]', message);
      return res.status(500).json({ error: message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
