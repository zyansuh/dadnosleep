import { fetchBinRecord, patchBinRecord, readBody } from './_shared.js';

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
      console.error('[suggestions]', message);
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
      console.error('[suggestions]', message);
      return res.status(500).json({ error: message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
