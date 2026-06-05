import type { Review, PointRecord } from '../../types/community';
import { CommunityPage } from '../../components/community/CommunityPage';

interface Props {
  reviews:           Review[];
  points:            PointRecord[];
  loading:           boolean;
  isAdmin:           boolean;
  suggestionCount?:  number;
  onAddReview:      (draft: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  onAddFriendInvite: (inviter: string, invitee: string) => Promise<void>;
  onUpdateReview:   (id: string, patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>) => Promise<void>;
  onDeleteReview:   (id: string) => Promise<void>;
  onRefresh:        () => Promise<void>;
  onBack:           () => void;
}

export function HomeCommunityView({
  reviews, points, loading, isAdmin, suggestionCount,
  onAddReview, onAddFriendInvite, onUpdateReview, onDeleteReview, onRefresh, onBack,
}: Props) {
  return (
    <CommunityPage
      reviews={reviews}
      points={points}
      loading={loading}
      isAdmin={isAdmin}
      suggestionCount={suggestionCount}
      onAddReview={onAddReview}
      onAddFriendInvite={onAddFriendInvite}
      onUpdateReview={onUpdateReview}
      onDeleteReview={onDeleteReview}
      onRefresh={onRefresh}
      onBack={onBack}
    />
  );
}
