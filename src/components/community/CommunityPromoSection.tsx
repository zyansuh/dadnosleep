import { PenLine, UserPlus } from 'lucide-react';
import { POINTS_PER_FRIEND_INVITE, POINTS_PER_REVIEW } from '../../constants/points';

interface Props {
  onOpenReview: () => void;
  onOpenInvite: () => void;
}

export function CommunityPromoSection({ onOpenReview, onOpenInvite }: Props) {
  return (
    <div className="rv-promo-row">
      <div className="rv-promo-card">
        <div className="rv-promo-left">
          <span className="rv-promo-badge">🎁 포인트 증정</span>
          <h3 className="rv-promo-title">후기를 남기고<br />포인트를 받으세요!</h3>
          <p className="rv-promo-desc">
            함께 본 OTT 프로그램 후기를 작성하면<br />
            <strong>{POINTS_PER_REVIEW.toLocaleString()} 포인트</strong>를 즉시 드려요!
          </p>
          <button type="button" className="rv-promo-btn" onClick={onOpenReview}>
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
            onClick={onOpenInvite}
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
  );
}
