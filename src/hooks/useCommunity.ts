import { useState, useCallback, useEffect, useRef } from 'react';
import type { Review, PointRecord } from '../types/community';
import {
  loadCommunityData,
  persistCommunityData,
  recalcPoints,
  LS_REVIEWS,
} from '../utils/communityStore';
import { saveMyNickname } from '../utils/nickname';
import { useToast } from '../context/ToastContext';

const REVIEW_POINTS = 1500;

interface UseCommunityReturn {
  reviews:        Review[];
  points:         PointRecord[];
  loading:        boolean;
  addReview:      (draft: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  updateReview:   (id: string, patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>) => Promise<void>;
  deleteReview:   (id: string) => Promise<void>;
  refreshReviews: () => Promise<void>;
  totalReviews:   number;
}

export function useCommunity(): UseCommunityReturn {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [points,  setPoints]  = useState<PointRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const reviewsRef = useRef<Review[]>([]);
  reviewsRef.current = reviews;

  const applyData = useCallback((data: { reviews: Review[]; points: PointRecord[] }) => {
    setReviews(data.reviews);
    setPoints(data.points);
  }, []);

  const persist = useCallback(async (nextReviews: Review[]) => {
    const nextPoints = recalcPoints(nextReviews, REVIEW_POINTS);
    setReviews(nextReviews);
    setPoints(nextPoints);
    const result = await persistCommunityData({ reviews: nextReviews, points: nextPoints });
    applyData(result.data);
    if (result.offline) showToast('오프라인 모드로 저장됩니다');
  }, [applyData, showToast]);

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
      if (e.key === LS_REVIEWS) void refreshReviews();
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
    await persist(nextReviews);
    return newReview;
  }, [persist]);

  const updateReview = useCallback(async (
    id: string,
    patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>,
  ) => {
    const nextReviews = reviewsRef.current.map(r =>
      r.id === id ? { ...r, ...patch } : r
    );
    await persist(nextReviews);
  }, [persist]);

  const deleteReview = useCallback(async (id: string) => {
    const nextReviews = reviewsRef.current.filter(r => r.id !== id);
    await persist(nextReviews);
  }, [persist]);

  return {
    reviews,
    points,
    loading,
    addReview,
    updateReview,
    deleteReview,
    refreshReviews,
    totalReviews: reviews.length,
  };
}
