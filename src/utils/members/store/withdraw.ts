import type { MemberEntry, MembersBinRecord } from '../../../types/member';
import { purgeCommunityDataForMember } from '../../community/communityStore';
import { getMemberRowKey } from '../memberIdentity';
import { loadMembersBin } from './load';
import { saveMembersBin } from './save';

export interface WithdrawMemberResult extends MembersBinRecord {
  removedReviews: number;
  removedInvites: number;
}

/** 명단 제거 + 해당 회원 후기·초대·포인트 전부 삭제 */
export async function withdrawMember(entry: MemberEntry): Promise<WithdrawMemberResult> {
  const purge = await purgeCommunityDataForMember(entry);

  const data = await loadMembersBin({ forAdmin: true });
  const key = getMemberRowKey(entry);
  const next = data.members.filter(m => getMemberRowKey(m) !== key);
  if (next.length === data.members.length) {
    throw new Error('회원을 찾을 수 없습니다.');
  }
  await saveMembersBin({ members: next });

  return {
    members: next,
    removedReviews: purge.removedReviews,
    removedInvites: purge.removedInvites,
  };
}
