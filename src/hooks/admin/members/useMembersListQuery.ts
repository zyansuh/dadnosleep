import { useCallback, useEffect, useState } from 'react';
import { useLatestRef } from '../../shared/useLatestRef';
import { loadMembersBin } from '../../../utils/members/membersStore';
import type { MemberEntry } from '../../../types/member';
import { toUserFacingError } from '../../../utils/messages/userMessages';
import { sortMembersByJoinedDesc } from './sortMembers';

interface FeedbackApi {
  clear:      () => void;
  showError:  (message: string) => void;
}

/** 명단 조회·새로고침 (마운트 시 1회 로드) */
export function useMembersListQuery(feedback: FeedbackApi) {
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const feedbackRef = useLatestRef(feedback);

  const reload = useCallback(async () => {
    setLoading(true);
    feedbackRef.current.clear();
    try {
      const data = await loadMembersBin({ forAdmin: true });
      setMembers(sortMembersByJoinedDesc(data.members));
    } catch (e) {
      feedbackRef.current.showError(
        toUserFacingError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      feedbackRef.current.clear();
      try {
        const data = await loadMembersBin({ forAdmin: true });
        if (cancelled) return;
        setMembers(sortMembersByJoinedDesc(data.members));
      } catch (e) {
        if (!cancelled) {
          feedbackRef.current.showError(
            toUserFacingError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.'),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { members, setMembers, loading, reload };
}
