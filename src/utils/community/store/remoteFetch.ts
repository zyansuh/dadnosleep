import { fetchJsonBinRecord } from '../../jsonbin/jsonbinRecord';
import type { CommunityData, RemoteResult } from './types';
import { COMMUNITY_BIN_ID, hasRemoteStore } from './remoteConfig';
import { parseRemoteRecord } from './remoteParse';
import { setPointsClearedLocal } from './pointsCleared';

export async function fetchRemote(): Promise<RemoteResult<CommunityData>> {
  if (!hasRemoteStore) return { ok: false, reason: 'unconfigured' };
  try {
    const record = await fetchJsonBinRecord(COMMUNITY_BIN_ID);
    const parsed = parseRemoteRecord(record);
    setPointsClearedLocal(parsed.pointsCleared);
    return { ok: true, data: parsed.data, pointsCleared: parsed.pointsCleared };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
