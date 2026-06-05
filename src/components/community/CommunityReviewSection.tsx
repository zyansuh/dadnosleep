import { PenLine, RefreshCw, UserPlus } from 'lucide-react';
import type { Review } from '../../types/community';
import { ReviewCard } from './ReviewCard';

interface Props {
  reviews:      Review[];
  loading:      boolean;
  refreshing:   boolean;
  vipKeys:      Set<string>;
  isAdmin:      boolean;
  onRefresh:    () => void;
  onOpenReview: () => void;
  onOpenInvite: () => void;
  onUpdate:     (id: string, patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>) => Promise<void>;
  onDelete:     (id: string) => Promise<void>;
}

export function CommunityReviewSection({
  reviews, loading, refreshing, vipKeys, isAdmin,
  onRefresh, onOpenReview, onOpenInvite, onUpdate, onDelete,
}: Props) {
  return (
    <main className="comm-main">
      <div className="comm-list-header">
        <h3>📋 모두의 후기 <span className="comm-count">{reviews.length}건</span></h3>
        <div className="comm-list-actions">
          <button type="button" className="rv-invite-btn" onClick={onOpenInvite}>
            <UserPlus size={14} /> 지인 초대 신고
          </button>
          <button
            type="button"
            className="rv-refresh-btn"
            onClick={onRefresh}
            disabled={loading || refreshing}
            title="다른 사람이 쓴 후기 불러오기"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? '불러오는 중…' : '새로고침'}
          </button>
          <button type="button" className="rv-write-btn" onClick={onOpenReview}>
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
              vipKeys={vipKeys}
              isAdmin={isAdmin}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
}
