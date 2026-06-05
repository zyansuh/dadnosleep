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

function isValidSnapshot(s) {
  return s
    && typeof s === 'object'
    && typeof s.week === 'string'
    && Array.isArray(s.data)
    && Array.isArray(s.memberRow);
}

/** @param {import('@vercel/node').VercelRequest} req */
/** @param {import('@vercel/node').VercelResponse} res */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const record = await fetchBinRecord();
    const schedule = record.schedule ?? {};

    if (!schedule.isPublished || !isValidSnapshot(schedule.published)) {
      return res.status(200).json({ ok: true, published: false, data: null });
    }

    return res.status(200).json({
      ok:          true,
      published:   true,
      data:        schedule.published,
      publishedAt: schedule.publishedAt ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : '편성표를 불러오지 못했습니다.';
    return res.status(500).json({ error: message });
  }
}
