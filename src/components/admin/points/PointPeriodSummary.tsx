import { POINTS_PER_FRIEND_INVITE, POINTS_PER_REVIEW } from '../../../constants/points';
import type { PointPeriodView } from '../../../utils/community/pointPeriod';

interface Props {
  view:               PointPeriodView;
  rangeLabel:         string;
  displayPoints:      number;
  activeCount:        number;
  periodReviewCount:  number;
  periodInviteCount:  number;
  totalReviewPoints:  number;
  totalInvitePoints:  number;
}

export function PointPeriodSummary({
  view, rangeLabel, displayPoints, activeCount,
  periodReviewCount, periodInviteCount, totalReviewPoints, totalInvitePoints,
}: Props) {
  const variantClass = `ap-summary--${view}`;

  return (
    <div className={`ap-summary ${variantClass}`}>
      <div className="ap-summary-stat">
        <span className="ap-summary-label">조회 기간</span>
        <strong>{rangeLabel}</strong>
      </div>

      {view === 'total' && (
        <>
          <div className="ap-summary-stat ap-summary-stat--highlight">
            <span className="ap-summary-label">기간 합산 포인트</span>
            <strong className="ap-summary-pts">{(totalReviewPoints + totalInvitePoints).toLocaleString()}P</strong>
          </div>
          <div className="ap-summary-stat ap-summary-stat--review">
            <span className="ap-summary-label">후기 포인트</span>
            <strong>{totalReviewPoints.toLocaleString()}P</strong>
            <span className="ap-summary-sub">{periodReviewCount}건 × {POINTS_PER_REVIEW.toLocaleString()}P</span>
          </div>
          <div className="ap-summary-stat ap-summary-stat--invite">
            <span className="ap-summary-label">지인 초대 포인트</span>
            <strong>{totalInvitePoints.toLocaleString()}P</strong>
            <span className="ap-summary-sub">{periodInviteCount}건 × {POINTS_PER_FRIEND_INVITE.toLocaleString()}P</span>
          </div>
        </>
      )}

      {view === 'review' && (
        <>
          <div className="ap-summary-stat ap-summary-stat--highlight ap-summary-stat--review">
            <span className="ap-summary-label">후기 포인트 합계</span>
            <strong className="ap-summary-pts">{displayPoints.toLocaleString()}P</strong>
          </div>
          <div className="ap-summary-stat">
            <span className="ap-summary-label">후기 작성</span>
            <strong>{periodReviewCount}건</strong>
          </div>
          <div className="ap-summary-stat">
            <span className="ap-summary-label">후기 포인트 있는 회원</span>
            <strong>{activeCount}명</strong>
          </div>
        </>
      )}

      {view === 'invite' && (
        <>
          <div className="ap-summary-stat ap-summary-stat--highlight ap-summary-stat--invite">
            <span className="ap-summary-label">지인 초대 포인트 합계</span>
            <strong className="ap-summary-pts">{displayPoints.toLocaleString()}P</strong>
          </div>
          <div className="ap-summary-stat">
            <span className="ap-summary-label">초대 신고</span>
            <strong>{periodInviteCount}건</strong>
          </div>
          <div className="ap-summary-stat">
            <span className="ap-summary-label">초대 포인트 있는 회원</span>
            <strong>{activeCount}명</strong>
          </div>
        </>
      )}
    </div>
  );
}
