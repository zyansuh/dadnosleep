import type { MembersBinRecord } from '../../../types/member';
import { saveMembersRecord } from '../../jsonbin/jsonbinRecord';
import { writeMembersCache } from './cache';
import { hasMembersRemote } from './remoteConfig';

export async function saveMembersBin(data: MembersBinRecord): Promise<void> {
  if (!hasMembersRemote()) {
    throw new Error('회원 명단을 저장할 수 없습니다. 운영 담당자에게 문의해 주세요.');
  }
  writeMembersCache(data.members);
  await saveMembersRecord(data.members);
}
