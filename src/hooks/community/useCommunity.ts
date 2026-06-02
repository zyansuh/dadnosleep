import { useState, useCallback, useEffect, useRef } from 'react';
import type { Review, PointRecord, FriendInvite } from '../../types/community';
import {
  loadCommunityData,
  persistCommunityData,
  recalcPoints,
  hasRemoteStore,
  LS_REVIEWS,
  LS_FRIEND_INVITES,
} from '../../utils/community/communityStore';
import { saveMyNickname } from '../../utils/nickname';
import { useToast } from '../../context/ToastContext';

interface UseCommunityReturn {
  reviews:         Review[];
  points:          PointRecord[];
  friendInvites:   FriendInvite[];
  loading:         boolean;
  addReview:       (draft: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  addFriendInvite: (nickname: string) => Promise<FriendInvite>;
  updateReview:    (id: string, patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>) => Promise<void>;
  deleteReview:    (id: string) => Promise<void>;
  refreshReviews:  () => Promise<void>;
  totalReviews:    number;
}

export function useCommunity(): UseCommunityReturn {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [points, setPoints]   = useState<PointRecord[]>([]);
  const [friendInvites, setFriendInvites] = useState<FriendInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const reviewsRef = useRef<Review[]>([]);
  const invitesRef = useRef<FriendInvite[]>([]);
  reviewsRef.current = reviews;
  invitesRef.current = friendInvites;

  const applyData = useCallback((data: {
    reviews: Review[];
    points: PointRecord[];
    friendInvites: FriendInvite[];
  }) => {
    setReviews(data.reviews);
    setPoints(data.points);
    setFriendInvites(data.friendInvites);
  }, []);

  const persist = useCallback(async (
    nextReviews: Review[],
    nextInvites: FriendInvite[],
  ) => {
    const nextPoints = recalcPoints(nextReviews, nextInvites);
    setReviews(nextReviews);
    setFriendInvites(nextInvites);
    setPoints(nextPoints);
    const result = await persistCommunityData({
      reviews:       nextReviews,
      friendInvites: nextInvites,
      points:        nextPoints,
    });
    applyData(result.data);
    if (result.offline) {
      showToast('이 기기에만 저장됐어요. 다른 사람 기록은 JSONBin 연결 후 새로고침하세요.');
    }
  }, [applyData, showToast]);

  useEffect(() => {
    if (!hasRemoteStore) {
      showToast('후기 공유 저장소(JSONBin)가 설정되지 않아 이 브라우저에만 보입니다.');
    }
  }, [showToast]);

  const refreshReviews = useCallback(async () => {
    const data = await loadCommunityData();
    applyData(data);
  }, [applyData]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await loadCommunityData();
      if (!cancelled) {
        applyData(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [applyData]);

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

  const addReview = useCallback(async (draft: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    saveMyNickname(draft.nickname);
    const newReview: Review = {
      ...draft,
      id:        `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const nextReviews = [newReview, ...reviewsRef.current];
    await persist(nextReviews, invitesRef.current);
    return newReview;
  }, [persist]);

  const addFriendInvite = useCallback(async (nickname: string): Promise<FriendInvite> => {
    const trimmed = nickname.trim();
    saveMyNickname(trimmed);
    const entry: FriendInvite = {
      id:        `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nickname:  trimmed,
      createdAt: new Date().toISOString(),
    };
    const nextInvites = [entry, ...invitesRef.current];
    await persist(reviewsRef.current, nextInvites);
    return entry;
  }, [persist]);

  const updateReview = useCallback(async (
    id: string,
    patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>,
  ) => {
    const nextReviews = reviewsRef.current.map(r =>
      r.id === id ? { ...r, ...patch } : r
    );
    await persist(nextReviews, invitesRef.current);
  }, [persist]);

  const deleteReview = useCallback(async (id: string) => {
    const nextReviews = reviewsRef.current.filter(r => r.id !== id);
    await persist(nextReviews, invitesRef.current);
  }, [persist]);

  return {
    reviews,
    points,
    friendInvites,
    loading,
    addReview,
    addFriendInvite,
    updateReview,
    deleteReview,
    refreshReviews,
    totalReviews: reviews.length,
  };
}
