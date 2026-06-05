import { useCallback, useEffect } from 'react';
import type { Review, PointRecord, FriendInvite } from '../../types/community';
import {
  loadCommunityData,
  hasRemoteStore,
  LS_REVIEWS,
  LS_FRIEND_INVITES,
} from '../../utils/community/communityStore';
import { useToast } from '../../context/ToastContext';

interface CommunityData {
  reviews:       Review[];
  points:        PointRecord[];
  friendInvites: FriendInvite[];
}

interface Args {
  applyData: (data: CommunityData) => void;
  setLoading: (loading: boolean) => void;
}

export function useCommunityLoad({ applyData, setLoading }: Args) {
  const { showToast } = useToast();

  const refreshReviews = useCallback(async () => {
    const data = await loadCommunityData();
    applyData(data);
  }, [applyData]);

  useEffect(() => {
    if (!hasRemoteStore) {
      showToast('후기가 이 브라우저에만 저장됩니다. 다른 기기에서는 보이지 않을 수 있어요.');
    }
  }, [showToast]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const data = await loadCommunityData();
      if (!cancelled) {
        applyData(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [applyData, setLoading]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_REVIEWS || e.key === LS_FRIEND_INVITES) void refreshReviews();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refreshReviews();
    };
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshReviews]);

  return { refreshReviews };
}
