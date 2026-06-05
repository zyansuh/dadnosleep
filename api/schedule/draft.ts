import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleScheduleDraft, handleScheduleSaveDraft } from '../../server/schedule/handlers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    await handleScheduleDraft(req, res);
    return;
  }
  if (req.method === 'PUT') {
    await handleScheduleSaveDraft(req, res);
    return;
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
