import { useState } from 'react';
import type { Review } from '../../types/community';
import type { PointRecord } from '../../types/community';
import { ReviewModal } from './ReviewModal';
import { FriendInviteModal } from './FriendInviteModal';
import { useDiscordAuth } from '../../context/DiscordAuthContext';
import { useMemberVipKeys } from '../../hooks/members/useMemberVipKeys';
import { CommunityPageHeader } from './CommunityPageHeader';
import { CommunityPromoSection } from './CommunityPromoSection';
import { CommunityRankingAside } from './CommunityRankingAside';
import { CommunityReviewSection } from './CommunityReviewSection';

interface Props {
  reviews:         Review[];
  points:          PointRecord[];
  loading:         boolean;
  isAdmin:         boolean;
  onAddReview:     (draft: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  onAddFriendInvite: (inviterNickname: string, inviteeNickname: string) => Promise<void>;
  onUpdateReview:  (id: string, patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>) => Promise<void>;
  onDeleteReview:  (id: string) => Promise<void>;
  onRefresh:       () => Promise<void>;
  onBack:          () => void;
}

export function CommunityPage({
  reviews, points, loading, isAdmin,
  onAddReview, onAddFriendInvite, onUpdateReview, onDeleteReview, onRefresh, onBack,
}: Props) {
  const discord = useDiscordAuth();
  const vipKeys = useMemberVipKeys();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const defaultNickname = discord.displayName ?? null;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleReviewSubmit = async (draft: Omit<Review, 'id' | 'createdAt'>) => {
    await onAddReview({
      ...draft,
      isVip: discord.isVip && discord.isMember,
    });
    await onRefresh();
  };

  const handleInviteSubmit = async (inviterNickname: string, inviteeNickname: string) => {
    await onAddFriendInvite(inviterNickname, inviteeNickname);
    await onRefresh();
  };

  return (
    <div className="comm-page">
      <CommunityPageHeader onBack={onBack} />

      <CommunityPromoSection
        onOpenReview={() => setReviewModalOpen(true)}
        onOpenInvite={() => setInviteModalOpen(true)}
      />

      <div className="comm-body">
        <CommunityRankingAside points={points} vipKeys={vipKeys} />

        <CommunityReviewSection
          reviews={reviews}
          loading={loading}
          refreshing={refreshing}
          vipKeys={vipKeys}
          isAdmin={isAdmin}
          onRefresh={() => void handleRefresh()}
          onOpenReview={() => setReviewModalOpen(true)}
          onOpenInvite={() => setInviteModalOpen(true)}
          onUpdate={onUpdateReview}
          onDelete={onDeleteReview}
        />
      </div>

      {reviewModalOpen && (
        <ReviewModal
          onSubmit={handleReviewSubmit}
          onClose={() => setReviewModalOpen(false)}
        />
      )}

      {inviteModalOpen && (
        <FriendInviteModal
          defaultNickname={defaultNickname}
          onSubmit={handleInviteSubmit}
          onClose={() => setInviteModalOpen(false)}
        />
      )}
    </div>
  );
}
