import { fetchBinRecord } from './_shared.js';

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
    console.error('[schedule-published]', message);
    return res.status(500).json({ error: message });
  }
}
