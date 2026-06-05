import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleDiscordCallback } from '../server/discord/callbackHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await handleDiscordCallback(
    req as unknown as import('node:http').IncomingMessage,
    res as unknown as import('node:http').ServerResponse,
  );
}
