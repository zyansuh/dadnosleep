import type { IncomingMessage, ServerResponse } from 'node:http';
import { isAdminDiscordUsername } from '../constants/adminUsers';
import { signDiscordAdminToken } from '../admin/discordAdminJwt';
import { exchangeDiscordCode } from './oauth';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', c => chunks.push(c as Buffer));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function handleDiscordCallback(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = JSON.parse(await readBody(req)) as { code?: string };
    const code = body.code;
    if (!code || typeof code !== 'string') {
      sendJson(res, 400, { error: 'Missing code' });
      return;
    }

    const user = await exchangeDiscordCode(code);
    let adminToken: string | undefined;
    if (isAdminDiscordUsername(user.username)) {
      adminToken = await signDiscordAdminToken(user.id, user.username);
    }

    sendJson(res, 200, {
      id:          user.id,
      username:    user.username,
      global_name: user.global_name,
      avatar:      user.avatar,
      adminToken,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Discord OAuth failed';
    console.error('[discord-callback]', message);
    sendJson(res, 500, { error: message });
  }
}
