import { fetchBinRecord, patchBinRecord, verifyAdmin } from './_shared.js';

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
