import { getJsonBinAccessKey } from './jsonbinEnv';
import type { JsonBinFullRecord } from './types';
import { classifyJsonBinStatus } from './http';
import { readJsonResponse } from '../http/parseJsonResponse';

export async function fetchJsonBinRecord(binId: string): Promise<JsonBinFullRecord> {
  const key = getJsonBinAccessKey();
  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: { 'X-Access-Key': key },
  });
  if (!res.ok) {
    throw new Error(classifyJsonBinStatus(res.status));
  }
  const json = await readJsonResponse<{ record?: JsonBinFullRecord }>(res);
  return json.record ?? {};
}
