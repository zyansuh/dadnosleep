import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleSuggestionGet } from '../../../server/suggestion/publicHandlers';
import { handleSuggestionStatus } from '../../../server/suggestion/handlers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = typeof req.query.id === 'string' ? req.query.id : '';
  if (!id) {
    return res.status(400).json({ error: 'id가 필요합니다.' });
  }

  if (req.method === 'GET') {
    await handleSuggestionGet(req, res, decodeURIComponent(id));
    return;
  }
  if (req.method === 'PATCH') {
    await handleSuggestionStatus(req, res, decodeURIComponent(id));
    return;
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
