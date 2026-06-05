import type { IncomingMessage, ServerResponse } from 'node:http';
import { signPasswordAdminToken } from './passwordAdminJwt';
import { verifyAdminPasswordInput } from './verifyRequest';

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

export async function handleAdminToken(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = JSON.parse(await readBody(req)) as { password?: string };
    const password = body.password ?? '';
    if (!verifyAdminPasswordInput(password)) {
      sendJson(res, 401, { error: '비밀번호가 올바르지 않습니다.' });
      return;
    }
    const token = await signPasswordAdminToken();
    sendJson(res, 200, { ok: true, token });
  } catch {
    sendJson(res, 500, { error: '인증 처리 중 오류가 발생했습니다.' });
  }
}
