import type { MembersBinRecord } from '../../../types/member';
import { loadMembersFromBin, saveMembersRecord } from '../../jsonbin/jsonbinRecord';
import { readMembersCache, writeMembersCache } from './cache';
import { mergeMemberLists } from './merge';
import { normalizeRecord } from './normalize';
import { hasMembersRemote } from './remoteConfig';

export async function loadMembersBin(options?: { forAdmin?: boolean }): Promise<MembersBinRecord> {
  const configMsg =
    '회원 명단 저장소가 연결되지 않았습니다. 사이트 운영 담당자에게 문의해 주세요.';

  const cached = readMembersCache();

  if (!hasMembersRemote()) {
    if (options?.forAdmin) throw new Error(configMsg);
    return { members: cached };
  }

  try {
    const raw = await loadMembersFromBin();
    const remote = normalizeRecord(raw);
    const merged = mergeMemberLists(cached, remote);

    if (merged.length > 0) {
      writeMembersCache(merged);
    }

    // 공유 Bin에서 후기 저장 등으로 members 필드가 빠진 경우 캐시로 복구
    if (options?.forAdmin && remote.length === 0 && cached.length > 0) {
      try {
        await saveMembersRecord(merged);
      } catch {
        /* 복구 실패 시에도 화면에는 캐시 표시 */
      }
    }

    return { members: merged.length > 0 ? merged : remote };
  } catch (e) {
    if (options?.forAdmin) {
      if (cached.length > 0) return { members: cached };
      throw e instanceof Error ? e : new Error('회원 명단을 불러오지 못했습니다.');
    }
    return { members: cached };
  }
}
