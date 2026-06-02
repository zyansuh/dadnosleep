import type { MemberEntry } from '../../../types/member';
import {
  getMemberCommunityKeys,
  inviteMatchesMemberKeys,
  nicknameMatchesMemberKeys,
} from '../../members/memberIdentity';
import type { PurgeMemberCommunityResult } from './types';
import { loadCommunityData } from './load';
import { adminWriteCommunityRecord } from './adminWrite';

/**
 * 탈퇴 회원의 후기·지인 초대·포인트 기록 삭제 (닉네임·@username·표시이름 기준 매칭).
 */
export async function purgeCommunityDataForMember(
  member: MemberEntry,
): Promise<PurgeMemberCommunityResult> {
  const keys = getMemberCommunityKeys(member);
  const data = await loadCommunityData();

  const reviews = data.reviews.filter(
    r => !nicknameMatchesMemberKeys(keys, r.nickname),
  );
  const friendInvites = data.friendInvites.filter(
    inv => !inviteMatchesMemberKeys(keys, inv),
  );

  const removedReviews = data.reviews.length - reviews.length;
  const removedInvites = data.friendInvites.length - friendInvites.length;

  const result = await adminWriteCommunityRecord(reviews, friendInvites);
  if (!result.ok) {
    throw new Error(result.message);
  }

  return { removedReviews, removedInvites };
}
