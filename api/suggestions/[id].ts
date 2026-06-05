import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dispatchAppApi } from '../../server/appApi/vercelHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = typeof req.query.id === 'string' ? req.query.id : '';
  if (!id) {
    res.status(400).json({ error: 'id가 필요합니다.' });
    return;
  }
  const handled = await dispatchAppApi(req, res, ['suggestions', id]);
  if (!handled) res.status(405).json({ error: 'Method not allowed' });
}
