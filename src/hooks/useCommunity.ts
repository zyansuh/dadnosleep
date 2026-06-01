import { useState, useCallback } from 'react';
import type { Review, PointRecord } from '../types/community';

// ── 영구 저장 키 (만료 없음) ───────────────────────────────
const LS_REVIEWS = 'dadnosleep-reviews-v1';
const LS_POINTS  = 'dadnosleep-points-v1';
const REVIEW_POINTS = 1500;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, data: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* 무시 */ }
}

interface UseCommunityReturn {
  reviews:   Review[];
  points:    PointRecord[];
  addReview: (draft: Omit<Review, 'id' | 'createdAt'>) => void;
  totalReviews: number;
}

export function useCommunity(): UseCommunityReturn {
  const [reviews, setReviews] = useState<Review[]>(() => load<Review[]>(LS_REVIEWS, []));
  const [points,  setPoints]  = useState<PointRecord[]>(() => load<PointRecord[]>(LS_POINTS, []));

  const addReview = useCallback((draft: Omit<Review, 'id' | 'createdAt'>) => {
    // 1. 후기 저장
    const newReview: Review = {
      ...draft,
      id:        `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setReviews(prev => {
      const next = [newReview, ...prev];
      save(LS_REVIEWS, next);
      return next;
    });

    // 2. 1500P 지급
    setPoints(prev => {
      const idx = prev.findIndex(p => p.nickname === draft.nickname);
      let next: PointRecord[];

      if (idx >= 0) {
        next = prev.map((p, i) =>
          i === idx
            ? { ...p, points: p.points + REVIEW_POINTS, reviewCount: p.reviewCount + 1 }
            : p
        );
      } else {
        next = [...prev, { nickname: draft.nickname, points: REVIEW_POINTS, reviewCount: 1 }];
      }

      next.sort((a, b) => b.points - a.points);
      save(LS_POINTS, next);
      return next;
    });
  }, []);

  return { reviews, points, addReview, totalReviews: reviews.length };
}
