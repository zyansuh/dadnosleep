import { useCallback, useEffect, useRef, useState } from 'react';
import type { Review, FriendInvite } from '../../../types/community';
import type { MemberEntry } from '../../../types/member';
import { loadCommunityData } from '../../../utils/community/communityStore';
import { loadMembersBin } from '../../../utils/members/membersStore';
import { toUserFacingError } from '../../../utils/messages/userMessages';

interface FeedbackApi {
  clear:     () => void;
  showError: (message: string) => void;
}

export function usePointReportQuery(feedback: FeedbackApi) {
  const [reviews, setReviews]             = useState<Review[]>([]);
  const [friendInvites, setFriendInvites] = useState<FriendInvite[]>([]);
  const [members, setMembers]               = useState<MemberEntry[]>([]);
  const [loading, setLoading]               = useState(true);
  const feedbackRef = useRef(feedback);
  feedbackRef.current = feedback;

  const reload = useCallback(async () => {
    setLoading(true);
    feedbackRef.current.clear();
    try {
      const [community, memberData] = await Promise.all([
        loadCommunityData(),
        loadMembersBin({ forAdmin: true }).catch(() => ({ members: [] as MemberEntry[] })),
      ]);
      setReviews(community.reviews);
      setFriendInvites(community.friendInvites);
      setMembers(memberData.members);
    } catch (e) {
      feedbackRef.current.showError(
        toUserFacingError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.'),
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
        const [community, memberData] = await Promise.all([
          loadCommunityData(),
          loadMembersBin({ forAdmin: true }).catch(() => ({ members: [] as MemberEntry[] })),
        ]);
        if (cancelled) return;
        setReviews(community.reviews);
        setFriendInvites(community.friendInvites);
        setMembers(memberData.members);
      } catch (e) {
        if (!cancelled) {
          feedbackRef.current.showError(
            toUserFacingError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.'),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { reviews, friendInvites, members, loading, reload };
}
