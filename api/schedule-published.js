function getServerJsonBinAccessKey() {
  const raw = process.env.JSONBIN_ACCESS_KEY
    ?? process.env.VITE_JSONBIN_ACCESS_KEY
    ?? '';
  return raw.replace(/^["']|["']$/g, '').trim();
}

function getServerCommunityBinId() {
  return (process.env.JSONBIN_BIN_ID
    ?? process.env.VITE_JSONBIN_BIN_ID
    ?? '').trim();
}

function isValidSnapshot(s) {
  if (!s || typeof s !== 'object') return false;
  return typeof s.week === 'string'
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
    const key = getServerJsonBinAccessKey();
    const binId = getServerCommunityBinId();
    if (!key || !binId) {
      return res.status(500).json({ error: 'JSONBin이 설정되지 않았습니다.' });
    }

    const fetchRes = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { 'X-Access-Key': key },
    });
    if (!fetchRes.ok) {
      return res.status(500).json({ error: '저장소를 불러오지 못했습니다.' });
    }

    const json = await fetchRes.json();
    const schedule = json.record?.schedule ?? {};

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
    console.error('[schedule-published]', message);
    return res.status(500).json({ error: message });
  }
}
