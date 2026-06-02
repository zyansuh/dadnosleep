import { POINTS_PER_FRIEND_INVITE, POINTS_PER_REVIEW } from '../../../constants/points';
import type { PointPeriodView, PointPeriodRow } from '../../../utils/community/pointPeriod';

interface Props {
  view:         PointPeriodView;
  rows:         PointPeriodRow[];
  loading:      boolean;
  emptyMessage: string;
}

function reviewPts(row: PointPeriodRow): number {
  return row.reviewCount * POINTS_PER_REVIEW;
}

function invitePts(row: PointPeriodRow): number {
  return row.inviteCount * POINTS_PER_FRIEND_INVITE;
}

export function PointPeriodMobileList({ view, rows, loading, emptyMessage }: Props) {
  if (loading) {
    return <p className="ap-mobile-empty">불러오는 중…</p>;
  }
  if (rows.length === 0) {
    return <p className="ap-mobile-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="ap-mobile-list" aria-label="포인트 랭킹 목록">
      {rows.map((row, i) => {
        const label = row.memberLabel ?? row.nickname;
        const active =
          view === 'review' ? row.reviewCount > 0
          : view === 'invite' ? row.inviteCount > 0
          : row.points > 0;

        return (
          <li
            key={`${row.nickname}-${i}`}
            className={`ap-mobile-card ap-mobile-card--${view}${active ? '' : ' ap-mobile-card--zero'}`}
          >
            <div className="ap-mobile-card-hd">
              <span className="ap-mobile-rank" aria-hidden>{i + 1}</span>
              <div className="ap-mobile-card-title">
                <strong>{label}</strong>
                {row.memberLabel && row.memberLabel !== row.nickname && (
                  <span className="ap-table-subnick">활동 닉: {row.nickname}</span>
                )}
              </div>
              {row.isRegistered ? (
                <span className="admin-linked-badge">등록</span>
              ) : (
                <span className="admin-pending-badge">미등록</span>
              )}
            </div>

            {view === 'total' ? (
              <dl className="ap-mobile-metrics ap-mobile-metrics--total">
                <div className="ap-mobile-metric ap-mobile-metric--review">
                  <dt>후기</dt>
                  <dd>
                    <span>{row.reviewCount}건</span>
                    <span className="ap-mobile-pts">{reviewPts(row).toLocaleString()}P</span>
                  </dd>
                </div>
                <div className="ap-mobile-metric ap-mobile-metric--invite">
                  <dt>지인 초대</dt>
                  <dd>
                    <span>{row.inviteCount}건</span>
                    <span className="ap-mobile-pts">{invitePts(row).toLocaleString()}P</span>
                  </dd>
                </div>
                <div className="ap-mobile-metric ap-mobile-metric--sum">
                  <dt>합산</dt>
                  <dd>
                    <span className="ap-mobile-pts ap-mobile-pts--gold">
                      {row.points.toLocaleString()}P
                    </span>
                  </dd>
                </div>
              </dl>
            ) : view === 'review' ? (
              <dl className="ap-mobile-metrics">
                <div className="ap-mobile-metric">
                  <dt>후기</dt>
                  <dd>{row.reviewCount}건</dd>
                </div>
                <div className="ap-mobile-metric ap-mobile-metric--primary">
                  <dt>포인트</dt>
                  <dd>
                    <span className="ap-mobile-pts ap-mobile-pts--review">
                      {reviewPts(row).toLocaleString()}P
                    </span>
                  </dd>
                </div>
              </dl>
            ) : (
              <dl className="ap-mobile-metrics">
                <div className="ap-mobile-metric">
                  <dt>초대</dt>
                  <dd>{row.inviteCount}건</dd>
                </div>
                <div className="ap-mobile-metric ap-mobile-metric--primary">
                  <dt>포인트</dt>
                  <dd>
                    <span className="ap-mobile-pts ap-mobile-pts--invite">
                      {invitePts(row).toLocaleString()}P
                    </span>
                  </dd>
                </div>
              </dl>
            )}
          </li>
        );
      })}
    </ul>
  );
}
