import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dispatchAppApi } from '../../server/appApi/vercelHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const handled = await dispatchAppApi(req, res, ['admin', 'token']);
  if (!handled) res.status(404).json({ error: 'Not found' });
}
