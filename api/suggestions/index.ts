import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleSuggestionCreate, handleSuggestionsList } from '../../server/suggestion/handlers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    await handleSuggestionsList(req, res);
    return;
  }
  if (req.method === 'POST') {
    await handleSuggestionCreate(req, res);
    return;
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
