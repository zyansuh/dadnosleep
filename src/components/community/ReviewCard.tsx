import { useState } from 'react';
import type { Review } from '../../types/community';

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

interface Props { review: Review; index: number; }

export function ReviewCard({ review, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const bg = CARD_COLORS[index % CARD_COLORS.length];
  const short = review.content.length > 80;

  return (
    <div className="rv-card" style={{ background: bg }}>
      <div className="rv-card-top">
        <span className="rv-program">{review.programTitle}</span>
        <span className="rv-stars">{starText(review.rating)}</span>
      </div>

      <p className="rv-content">
        {expanded || !short
          ? review.content
          : review.content.slice(0, 80) + '…'}
        {short && (
          <button className="rv-more" onClick={() => setExpanded(v => !v)}>
            {expanded ? ' 접기' : ' 더보기'}
          </button>
        )}
      </p>

      <div className="rv-card-bottom">
        <span className="rv-nick">👤 {review.nickname}</span>
        <span className="rv-time">{timeAgo(review.createdAt)}</span>
      </div>
    </div>
  );
}
