import { fetchBinRecord, patchBinRecord, readBody, verifyAdmin } from './_shared.js';

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
  const id = typeof req.query.id === 'string' ? req.query.id : '';
  if (!id) {
    return res.status(400).json({ error: 'id가 필요합니다.' });
  }

  if (req.method === 'GET') {
    try {
      const record = await fetchBinRecord();
      const item = normalizeList(record.suggestions).find(s => s.id === id);
      if (!item) {
        return res.status(404).json({ error: '건의사항을 찾을 수 없습니다.' });
      }
      return res.status(200).json({ ok: true, suggestion: item });
    } catch (e) {
      const message = e instanceof Error ? e.message : '건의사항을 불러오지 못했습니다.';
      return res.status(500).json({ error: message });
    }
  }

  if (req.method === 'PATCH') {
    const auth = await verifyAdmin(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.message });
    }

    try {
      const body = readBody(req);
      const status = body.status;
      if (!status || !VALID_STATUS.has(status)) {
        return res.status(400).json({ error: '유효하지 않은 처리 상태입니다.' });
      }

      const record = await fetchBinRecord();
      const list = normalizeList(record.suggestions);
      const idx = list.findIndex(s => s.id === id);
      if (idx < 0) {
        return res.status(404).json({ error: '건의사항을 찾을 수 없습니다.' });
      }

      list[idx] = { ...list[idx], status };
      await patchBinRecord({ suggestions: list });
      return res.status(200).json({ ok: true, suggestion: list[idx] });
    } catch (e) {
      const message = e instanceof Error ? e.message : '상태 변경에 실패했습니다.';
      return res.status(500).json({ error: message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
