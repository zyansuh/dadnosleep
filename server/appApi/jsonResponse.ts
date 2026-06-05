import type { VercelResponse } from '@vercel/node';
import type { ServerResponse } from 'node:http';

export type ApiResponse = ServerResponse | VercelResponse;

function isVercelResponse(res: ApiResponse): res is VercelResponse {
  return typeof (res as VercelResponse).status === 'function'
    && typeof (res as VercelResponse).json === 'function';
}

export function sendJson(res: ApiResponse, status: number, data: unknown): void {
  if (isVercelResponse(res)) {
    res.status(status).json(data);
    return;
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
