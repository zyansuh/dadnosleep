import { useState } from 'react';
import { ArrowLeft, PenLine, RefreshCw, UserPlus } from 'lucide-react';
import type { Review } from '../../types/community';
import type { PointRecord } from '../../types/community';
import { POINTS_PER_FRIEND_INVITE, POINTS_PER_REVIEW } from '../../constants/points';
import { ReviewCard } from './ReviewCard';
import { ReviewModal } from './ReviewModal';
import { FriendInviteModal } from './FriendInviteModal';
import { PointRanking } from './PointRanking';
import { useDiscordAuth } from '../../context/DiscordAuthContext';

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
  const [reviewModalOpen, setReviewModalOpen]   = useState(false);
  const [inviteModalOpen, setInviteModalOpen]   = useState(false);
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
    await onAddReview(draft);
    await onRefresh();
  };

  const handleInviteSubmit = async (inviterNickname: string, inviteeNickname: string) => {
    await onAddFriendInvite(inviterNickname, inviteeNickname);
    await onRefresh();
  };

  return (
    <div className="comm-page">
      <div className="comm-page-header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={18} /> 돌아가기
        </button>
        <div className="comm-page-heading">
          <h2 className="comm-page-title">💬 커뮤니티</h2>
          <p className="comm-page-sub">모든 회원·방문자의 후기를 이곳에서 볼 수 있어요.</p>
        </div>
      </div>

      <div className="rv-promo-row">
        <div className="rv-promo-card">
          <div className="rv-promo-left">
            <span className="rv-promo-badge">🎁 포인트 증정</span>
            <h3 className="rv-promo-title">후기를 남기고<br />포인트를 받으세요!</h3>
            <p className="rv-promo-desc">
              함께 본 OTT 프로그램 후기를 작성하면<br />
              <strong>{POINTS_PER_REVIEW.toLocaleString()} 포인트</strong>를 즉시 드려요!
            </p>
            <button className="rv-promo-btn" onClick={() => setReviewModalOpen(true)}>
              <PenLine size={16} /> 후기 작성하기
            </button>
          </div>
          <div className="rv-promo-right">
            <span className="rv-promo-points">{POINTS_PER_REVIEW.toLocaleString()}P</span>
            <span className="rv-promo-sub">후기 1건당 지급</span>
          </div>
        </div>

        <div className="rv-promo-card rv-promo-card-invite">
          <div className="rv-promo-left">
            <span className="rv-promo-badge rv-promo-badge-invite">🤝 지인 초대</span>
            <h3 className="rv-promo-title">지인을 초대하고<br />포인트를 받으세요!</h3>
            <p className="rv-promo-desc">
              동호회에 지인을 데려오셨다면<br />
              <strong>{POINTS_PER_FRIEND_INVITE.toLocaleString()} 포인트</strong>를 신고해 주세요!
            </p>
            <button
              type="button"
              className="rv-promo-btn rv-promo-btn-invite"
              onClick={() => setInviteModalOpen(true)}
            >
              <UserPlus size={16} /> 지인 초대 완료 신고
            </button>
          </div>
          <div className="rv-promo-right">
            <span className="rv-promo-points">{POINTS_PER_FRIEND_INVITE.toLocaleString()}P</span>
            <span className="rv-promo-sub">초대 1건당 지급</span>
          </div>
        </div>
      </div>

      <div className="comm-body">
        <aside className="comm-sidebar">
          <PointRanking points={points} />
        </aside>

        <main className="comm-main">
          <div className="comm-list-header">
            <h3>📋 모두의 후기 <span className="comm-count">{reviews.length}건</span></h3>
            <div className="comm-list-actions">
              <button
                type="button"
                className="rv-invite-btn"
                onClick={() => setInviteModalOpen(true)}
              >
                <UserPlus size={14} /> 지인 초대 신고
              </button>
              <button
                type="button"
                className="rv-refresh-btn"
                onClick={() => void handleRefresh()}
                disabled={loading || refreshing}
                title="다른 사람이 쓴 후기 불러오기"
              >
                <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
                {refreshing ? '불러오는 중…' : '새로고침'}
              </button>
              <button type="button" className="rv-write-btn" onClick={() => setReviewModalOpen(true)}>
                <PenLine size={14} /> 후기 작성
              </button>
            </div>
          </div>

          {loading ? (
            <div className="comm-empty">
              <p>후기를 불러오는 중…</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="comm-empty">
              <p>🎬</p>
              <p>아직 후기가 없어요.</p>
              <p>첫 번째 후기를 남겨보세요!</p>
            </div>
          ) : (
            <div className="rv-grid">
              {reviews.map((rv, i) => (
                <ReviewCard
                  key={rv.id}
                  review={rv}
                  index={i}
                  isAdmin={isAdmin}
                  onUpdate={onUpdateReview}
                  onDelete={onDeleteReview}
                />
              ))}
            </div>
          )}
        </main>
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
