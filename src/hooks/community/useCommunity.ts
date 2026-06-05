import { useState, useCallback } from 'react';
import type { Review, PointRecord, FriendInvite } from '../../types/community';
import { useCommunityLoad } from './useCommunityLoad';
import { useCommunityMutations } from './useCommunityMutations';

interface UseCommunityReturn {
  reviews:         Review[];
  points:          PointRecord[];
  friendInvites:   FriendInvite[];
  loading:         boolean;
  addReview:       (draft: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  addFriendInvite: (inviterNickname: string, inviteeNickname: string) => Promise<FriendInvite>;
  updateReview:    (id: string, patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>) => Promise<void>;
  deleteReview:    (id: string) => Promise<void>;
  refreshReviews:  () => Promise<void>;
  totalReviews:    number;
}

export function useCommunity(): UseCommunityReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [points, setPoints]   = useState<PointRecord[]>([]);
  const [friendInvites, setFriendInvites] = useState<FriendInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const applyData = useCallback((data: {
    reviews: Review[];
    points: PointRecord[];
    friendInvites: FriendInvite[];
  }) => {
    setReviews(data.reviews);
    setPoints(data.points);
    setFriendInvites(data.friendInvites);
  }, []);

  const { refreshReviews } = useCommunityLoad({ applyData, setLoading });

  const mutations = useCommunityMutations({ reviews, friendInvites, applyData });

  return {
    reviews,
    points,
    friendInvites,
    loading,
    addReview:       mutations.addReview,
    addFriendInvite: mutations.addFriendInvite,
    updateReview:    mutations.updateReview,
    deleteReview:    mutations.deleteReview,
    refreshReviews,
    totalReviews:    reviews.length,
  };
}
