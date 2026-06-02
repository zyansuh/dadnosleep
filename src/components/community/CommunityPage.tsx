import { useState } from 'react';
import { ArrowLeft, PenLine } from 'lucide-react';
import type { Review } from '../../types/community';
import type { PointRecord } from '../../types/community';
import { ReviewCard } from './ReviewCard';
import { ReviewModal } from './ReviewModal';
import { PointRanking } from './PointRanking';

interface Props {
  reviews:        Review[];
  points:         PointRecord[];
  loading:        boolean;
  isAdmin:        boolean;
  onAddReview:    (draft: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  onUpdateReview: (id: string, patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>) => Promise<void>;
  onDeleteReview: (id: string) => Promise<void>;
  onRefresh:      () => Promise<void>;
  onBack:         () => void;
}

export function CommunityPage({
  reviews, points, loading, isAdmin, onAddReview, onUpdateReview, onDeleteReview, onRefresh, onBack,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (draft: Omit<Review, 'id' | 'createdAt'>) => {
    await onAddReview(draft);
    await onRefresh();
  };

  return (
    <div className="comm-page">
      <div className="comm-page-header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={18} /> 돌아가기
        </button>
        <h2 className="comm-page-title">💬 커뮤니티</h2>
      </div>

      <div className="rv-promo-card">
        <div className="rv-promo-left">
          <span className="rv-promo-badge">🎁 포인트 증정</span>
          <h3 className="rv-promo-title">후기를 남기고<br />포인트를 받으세요!</h3>
          <p className="rv-promo-desc">
            함께 본 OTT 프로그램 후기를 작성하면<br />
            <strong>1,500 포인트</strong>를 즉시 드려요!
          </p>
          <button className="rv-promo-btn" onClick={() => setModalOpen(true)}>
            <PenLine size={16} /> 후기 작성하기
          </button>
        </div>
        <div className="rv-promo-right">
          <span className="rv-promo-points">1,500P</span>
          <span className="rv-promo-sub">후기 1건당 지급</span>
        </div>
      </div>

      <div className="comm-body">
        <aside className="comm-sidebar">
          <PointRanking points={points} />
        </aside>

        <main className="comm-main">
          <div className="comm-list-header">
            <h3>📋 전체 후기 <span className="comm-count">{reviews.length}건</span></h3>
            <button className="rv-write-btn" onClick={() => setModalOpen(true)}>
              <PenLine size={14} /> 후기 작성
            </button>
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

      {modalOpen && (
        <ReviewModal
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
