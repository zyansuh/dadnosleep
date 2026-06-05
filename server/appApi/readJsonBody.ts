import type { IncomingMessage } from 'node:http';

export type ApiRequest = IncomingMessage & { body?: unknown };

function readStreamBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', c => chunks.push(c as Buffer));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

export async function readJsonBody<T>(req: ApiRequest): Promise<T> {
  const { body } = req;
  if (body !== undefined && body !== null && body !== '') {
    if (typeof body === 'string') return JSON.parse(body) as T;
    return body as T;
  }
  const text = await readStreamBody(req);
  if (!text.trim()) throw new Error('Missing request body');
  return JSON.parse(text) as T;
}
