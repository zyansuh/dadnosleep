import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Review } from '../../types/community';
import { isMyReview } from '../../utils/nickname';
import { ConfirmModal } from '../ConfirmModal';
import { ReviewEditModal } from './ReviewEditModal';

function starText(r: number) {
  return '⭐'.repeat(r) + '☆'.repeat(5 - r);
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

const CARD_COLORS = [
  'linear-gradient(135deg, #1e1040, #2d1b69)',
  'linear-gradient(135deg, #1a0a30, #4a1942)',
  'linear-gradient(135deg, #0d1b2a, #1b3a5c)',
  'linear-gradient(135deg, #1a1a2e, #16213e)',
  'linear-gradient(135deg, #2d0a0a, #5c1c1c)',
];

interface Props {
  review:       Review;
  index:        number;
  isAdmin:      boolean;
  onUpdate:     (id: string, patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>) => Promise<void>;
  onDelete:     (id: string) => Promise<void>;
}

export function ReviewCard({ review, index, isAdmin, onUpdate, onDelete }: Props) {
  const [expanded,     setExpanded]     = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);
  const [deleteOpen,   setDeleteOpen]   = useState(false);
  const bg = CARD_COLORS[index % CARD_COLORS.length];
  const short = review.content.length > 80;
  const mine = isMyReview(review.nickname);
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
          <span className="rv-nick">👤 {review.nickname}{mine && <span className="rv-mine-badge">나</span>}</span>
          <span className="rv-time">{timeAgo(review.createdAt)}</span>
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
