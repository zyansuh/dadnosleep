import { getServerCommunityBinId, getServerJsonBinAccessKey } from './config';

export interface ServerJsonBinRecord {
  reviews?:        unknown[];
  points?:         unknown[];
  friendInvites?:  unknown[];
  members?:        unknown[];
  pointsCleared?:  boolean;
  schedule?:       unknown;
  suggestions?:    unknown[];
}

function classifyStatus(status: number): string {
  if (status === 401) return '저장소 접근에 실패했습니다.';
  if (status === 404) return '저장소를 찾을 수 없습니다.';
  return '저장에 실패했습니다.';
}

export async function fetchServerBinRecord(): Promise<ServerJsonBinRecord> {
  const key = getServerJsonBinAccessKey();
  const binId = getServerCommunityBinId();
  if (!key || !binId) throw new Error('JSONBin이 설정되지 않았습니다.');

  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: { 'X-Access-Key': key },
  });
  if (!res.ok) throw new Error(classifyStatus(res.status));
  const json = await res.json() as { record?: ServerJsonBinRecord };
  return json.record ?? {};
}

export async function putServerBinRecord(record: ServerJsonBinRecord): Promise<void> {
  const key = getServerJsonBinAccessKey();
  const binId = getServerCommunityBinId();
  if (!key || !binId) throw new Error('JSONBin이 설정되지 않았습니다.');

  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
    method:  'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': key,
    },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error(classifyStatus(res.status));
}

export async function patchServerBinRecord(
  patch: Partial<ServerJsonBinRecord>,
): Promise<ServerJsonBinRecord> {
  const existing = await fetchServerBinRecord();
  const next: ServerJsonBinRecord = { ...existing, ...patch };
  await putServerBinRecord(next);
  return next;
}
