import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleLogin } from '../../../server/auth/handlers';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return handleLogin(req, res);
}
