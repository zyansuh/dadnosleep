import { useEffect, useState } from 'react';
import { buildVipNicknameKeys } from '../../utils/members/memberVip';
import { loadMembersBin } from '../../utils/members/membersStore';

/** 후기·랭킹 VIP 왕관 매칭용 닉네임 키 */
export function useMemberVipKeys(): Set<string> {
  const [keys, setKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let cancelled = false;
    void loadMembersBin()
      .then(data => {
        if (!cancelled) setKeys(buildVipNicknameKeys(data.members));
      })
      .catch(() => {
        if (!cancelled) setKeys(new Set());
      });
    return () => { cancelled = true; };
  }, []);

  return keys;
}
