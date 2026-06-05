import { fetchBinRecord, patchBinRecord, readBody, verifyAdmin } from './_shared.js';

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
  if (req.method === 'GET') {
    const auth = await verifyAdmin(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.message });
    }

    try {
      const record = await fetchBinRecord();
      const schedule = parseSchedule(record.schedule);
      return res.status(200).json({
        ok:          true,
        draft:       isValidSnapshot(schedule.draft) ? schedule.draft : null,
        published:   isValidSnapshot(schedule.published) ? schedule.published : null,
        isPublished: schedule.isPublished === true,
        publishedAt: schedule.publishedAt ?? null,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : '편성표를 불러오지 못했습니다.';
      return res.status(500).json({ error: message });
    }
  }

  if (req.method === 'PUT') {
    const auth = await verifyAdmin(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.message });
    }

    try {
      const body = readBody(req);
      if (!isValidSnapshot(body.draft)) {
        return res.status(400).json({ error: '유효하지 않은 편성표 데이터입니다.' });
      }

      const record = await fetchBinRecord();
      const prev = parseSchedule(record.schedule);
      await patchBinRecord({
        schedule: { ...prev, draft: body.draft },
      });
      return res.status(200).json({ ok: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : '편성표 저장에 실패했습니다.';
      return res.status(500).json({ error: message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
