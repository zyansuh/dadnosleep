import { getJsonBinAccessKey } from './jsonbinEnv';
import type { JsonBinFullRecord } from './types';
import { classifyJsonBinStatus } from './http';

export async function putJsonBinRecord(binId: string, record: JsonBinFullRecord): Promise<void> {
  const key = getJsonBinAccessKey();
  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
    method:  'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': key,
    },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    throw new Error(classifyJsonBinStatus(res.status));
  }
}
