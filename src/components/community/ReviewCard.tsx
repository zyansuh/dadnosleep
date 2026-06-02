import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Review } from '../../types/community';
import { isMyReview } from '../../utils/nickname';
import { reviewShowsVipCrown } from '../../utils/members/memberVip';
import { VipCrown } from '../VipCrown';
import { REVIEW_CARD_COLORS, reviewTimeAgo, starText } from '../../utils/community/reviewDisplay';
import { ConfirmModal } from '../ConfirmModal';
import { ReviewEditModal } from './ReviewEditModal';

interface Props {
  review:       Review;
  index:        number;
  vipKeys:      Set<string>;
  isAdmin:      boolean;
  onUpdate:     (id: string, patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>) => Promise<void>;
  onDelete:     (id: string) => Promise<void>;
}

export function ReviewCard({ review, index, vipKeys, isAdmin, onUpdate, onDelete }: Props) {
  const [expanded,     setExpanded]     = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);
  const [deleteOpen,   setDeleteOpen]   = useState(false);
  const bg = REVIEW_CARD_COLORS[index % REVIEW_CARD_COLORS.length];
  const short = review.content.length > 80;
  const mine = isMyReview(review.nickname);
  const showVip = reviewShowsVipCrown(review, vipKeys);
  const canManage = mine || isAdmin;

  return (
    <>
      <div className="rv-card" style={{ background: bg }}>
        <div className="rv-card-top">
          <span className="rv-program">{review.programTitle}</span>
          <div className="rv-card-top-right">
            <span className="rv-stars">{starText(review.rating)}</span>
            {canManage && (
              <div className="rv-owner-actions">
                <button type="button" className="rv-action-btn" title="수정" onClick={() => setEditOpen(true)}>
                  <Pencil size={14} />
                </button>
                <button type="button" className="rv-action-btn rv-action-del" title="삭제" onClick={() => setDeleteOpen(true)}>
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="rv-content">
          {expanded || !short ? review.content : review.content.slice(0, 80) + '…'}
          {short && (
            <button className="rv-more" onClick={() => setExpanded(v => !v)}>
              {expanded ? ' 접기' : ' 더보기'}
            </button>
          )}
        </p>

        <div className="rv-card-bottom">
          <span className="rv-nick">
            👤 {review.nickname}
            {showVip && <VipCrown className="rv-vip-crown" />}
            {mine && <span className="rv-mine-badge">나</span>}
          </span>
          <span className="rv-time">{reviewTimeAgo(review.createdAt)}</span>
        </div>
      </div>

      {editOpen && (
        <ReviewEditModal
          review={review}
          onSave={patch => onUpdate(review.id, patch)}
          onClose={() => setEditOpen(false)}
        />
      )}

      {deleteOpen && (
        <ConfirmModal
          title="후기 삭제"
          message="이 후기를 삭제할까요? 포인트는 후기 수에 맞게 다시 계산됩니다."
          confirmLabel="삭제"
          danger
          onConfirm={() => void onDelete(review.id)}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </>
  );
}
