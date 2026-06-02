import type { Review } from '../../types/community';
import type { MemberEntry } from '../../types/member';
import { normalizeMemberKey } from './memberIdentity';
import { displayMemberNickname } from './memberDisplay';

/** 명단에 isVip 필드가 없으면 true (기존 회원 호환) */
export function normalizeMemberIsVip(raw: unknown): boolean {
  if (raw && typeof raw === 'object' && typeof (raw as { isVip?: unknown }).isVip === 'boolean') {
    return (raw as { isVip: boolean }).isVip;
  }
  return true;
}

export function isMemberVip(m: MemberEntry): boolean {
  return m.isVip === true;
}

/** 후기·랭킹 닉네임 매칭용 */
export function buildVipNicknameKeys(members: MemberEntry[]): Set<string> {
  const keys = new Set<string>();
  for (const m of members) {
    if (!isMemberVip(m)) continue;
    const add = (v: string | undefined | null) => {
      const t = v?.trim();
      if (t) keys.add(normalizeMemberKey(t));
    };
    add(m.username);
    add(m.globalName);
    add(m.nickname);
    add(displayMemberNickname(m));
  }
  return keys;
}

export function nicknameHasVipBadge(nickname: string, vipKeys: Set<string>): boolean {
  const t = nickname?.trim();
  if (!t) return false;
  return vipKeys.has(normalizeMemberKey(t));
}

export function reviewShowsVipCrown(review: Review, vipKeys: Set<string>): boolean {
  if (review.isVip === true) return true;
  return nicknameHasVipBadge(review.nickname, vipKeys);
}
