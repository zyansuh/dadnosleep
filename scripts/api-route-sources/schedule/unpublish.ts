import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleScheduleUnpublish } from '../../../server/schedule/handlers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  await handleScheduleUnpublish(req, res);
}
