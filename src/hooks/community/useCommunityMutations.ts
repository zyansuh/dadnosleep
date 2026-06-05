import { useCallback } from 'react';
import type { Review, PointRecord, FriendInvite } from '../../types/community';
import {
  persistCommunityData,
  recalcPoints,
} from '../../utils/community/communityStore';
import { saveMyNickname } from '../../utils/nickname';
import { useToast } from '../../context/ToastContext';
import { useLatestRef } from '../shared/useLatestRef';

interface Args {
  reviews:       Review[];
  friendInvites: FriendInvite[];
  applyData: (data: {
    reviews:       Review[];
    points:        PointRecord[];
    friendInvites: FriendInvite[];
  }) => void;
}

export function useCommunityMutations({ reviews, friendInvites, applyData }: Args) {
  const { showToast } = useToast();
  const reviewsRef = useLatestRef(reviews);
  const invitesRef = useLatestRef(friendInvites);

  const persist = useCallback(async (
    nextReviews: Review[],
    nextInvites: FriendInvite[],
  ) => {
    const nextPoints = recalcPoints(nextReviews, nextInvites);
    const result = await persistCommunityData({
      reviews:       nextReviews,
      friendInvites: nextInvites,
      points:        nextPoints,
    });
    applyData(result.data);
    if (result.offline) {
      showToast('이 기기에만 저장됐어요. 다른 사람이 쓴 내용은 새로고침해 보세요.');
    }
  }, [applyData, showToast]);

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
  }, [persist, reviewsRef, invitesRef]);

  const addFriendInvite = useCallback(async (
    inviterNickname: string,
    inviteeNickname: string,
  ): Promise<FriendInvite> => {
    const trimmed = inviterNickname.trim();
    const invitee = inviteeNickname.trim();
    saveMyNickname(trimmed);
    const entry: FriendInvite = {
      id:              `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nickname:        trimmed,
      inviteeNickname: invitee,
      createdAt:       new Date().toISOString(),
    };
    const nextInvites = [entry, ...invitesRef.current];
    await persist(reviewsRef.current, nextInvites);
    return entry;
  }, [persist, reviewsRef, invitesRef]);

  const updateReview = useCallback(async (
    id: string,
    patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>,
  ) => {
    const nextReviews = reviewsRef.current.map(r =>
      r.id === id ? { ...r, ...patch } : r
    );
    await persist(nextReviews, invitesRef.current);
  }, [persist, reviewsRef, invitesRef]);

  const deleteReview = useCallback(async (id: string) => {
    const nextReviews = reviewsRef.current.filter(r => r.id !== id);
    await persist(nextReviews, invitesRef.current);
  }, [persist, reviewsRef, invitesRef]);

  return { addReview, addFriendInvite, updateReview, deleteReview };
}
