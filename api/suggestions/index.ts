import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dispatchAppApi } from '../../server/appApi/vercelHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const handled = await dispatchAppApi(req, res, ['suggestions']);
  if (!handled) res.status(405).json({ error: 'Method not allowed' });
}
