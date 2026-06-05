import { fetchBinRecord, patchBinRecord, verifyAdmin } from './_shared.js';

function isValidSnapshot(s) {
  return s
    && typeof s === 'object'
    && typeof s.week === 'string'
    && Array.isArray(s.data)
    && Array.isArray(s.memberRow);
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
    const draft = isValidSnapshot(prev.draft) ? prev.draft : prev.published;
    if (!isValidSnapshot(draft)) {
      return res.status(400).json({ error: '공개할 편성표가 없습니다. 먼저 저장해 주세요.' });
    }

    const publishedAt = new Date().toISOString();
    await patchBinRecord({
      schedule: {
        ...prev,
        draft,
        published:   draft,
        isPublished: true,
        publishedAt,
      },
    });
    return res.status(200).json({ ok: true, publishedAt });
  } catch (e) {
    const message = e instanceof Error ? e.message : '편성표 공개에 실패했습니다.';
    return res.status(500).json({ error: message });
  }
}
