import type { Connect } from 'vite';
import { exchangeDiscordCode } from './oauth';

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export function discordApiMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url ?? '';
    if (url.split('?')[0] !== '/api/discord-callback') {
      next();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    void (async () => {
      try {
        const raw = await readBody(req);
        const body = raw ? JSON.parse(raw) as { code?: string } : {};
        const code = body.code;
        if (!code) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing code' }));
          return;
        }

        const user = await exchangeDiscordCode(code);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          id:          user.id,
          username:    user.username,
          global_name: user.global_name,
          avatar:      user.avatar,
        }));
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Discord OAuth failed';
        console.error('[discord-callback dev]', message);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: message }));
      }
    })();
  };
}
