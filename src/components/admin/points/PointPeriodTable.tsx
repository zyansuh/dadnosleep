import { POINTS_PER_FRIEND_INVITE, POINTS_PER_REVIEW } from '../../../constants/points';
import type { PointPeriodView, PointPeriodRow } from '../../../utils/community/pointPeriod';

interface Props {
  view:            PointPeriodView;
  rows:            PointPeriodRow[];
  loading:         boolean;
  registeredOnly:  boolean;
  memberCount:     number;
  emptyMessage:    string;
}

function reviewPts(row: PointPeriodRow): number {
  return row.reviewCount * POINTS_PER_REVIEW;
}

function invitePts(row: PointPeriodRow): number {
  return row.inviteCount * POINTS_PER_FRIEND_INVITE;
}

function isActiveRow(row: PointPeriodRow, view: PointPeriodView): boolean {
  if (view === 'review') return row.reviewCount > 0;
  if (view === 'invite') return row.inviteCount > 0;
  return row.points > 0;
}

export function PointPeriodTable({ view, rows, loading, emptyMessage }: Props) {
  const colSpan = view === 'total' ? 9 : 5;

  return (
    <div className={`ap-table-wrap ap-table-wrap--${view}`}>
      <table className={`admin-table ap-table ap-table--${view}`}>
        <thead>
          {view === 'total' ? (
            <>
              <tr className="ap-table-head-group">
                <th rowSpan={2}>#</th>
                <th rowSpan={2}>닉네임</th>
                <th rowSpan={2}>등록</th>
                <th colSpan={2} className="ap-th-group ap-th-group--review">후기</th>
                <th colSpan={2} className="ap-th-group ap-th-group--invite">지인 초대</th>
                <th rowSpan={2} className="ap-th-group ap-th-group--total">합산</th>
              </tr>
              <tr className="ap-table-head-sub">
                <th>건수</th>
                <th>포인트</th>
                <th>건수</th>
                <th>포인트</th>
              </tr>
            </>
          ) : (
            <tr>
              <th>#</th>
              <th>닉네임</th>
              <th>등록</th>
              {view !== 'invite' && <th>후기 (건)</th>}
              {view !== 'review' && <th>초대 (건)</th>}
              <th>{view === 'review' ? '후기 포인트' : '초대 포인트'}</th>
            </tr>
          )}
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colSpan} className="admin-table-empty">불러오는 중…</td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="admin-table-empty">{emptyMessage}</td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={`${row.nickname}-${i}`}
                className={isActiveRow(row, view) ? '' : 'ap-table-row-zero'}
              >
                <td className="ap-cell-rank">{i + 1}</td>
                <td className="ap-cell-nick">
                  <strong>{row.memberLabel ?? row.nickname}</strong>
                  {row.memberLabel && row.memberLabel !== row.nickname && (
                    <span className="ap-table-subnick">활동 닉: {row.nickname}</span>
                  )}
                </td>
                <td>
                  {row.isRegistered ? (
                    <span className="admin-linked-badge">등록</span>
                  ) : (
                    <span className="admin-pending-badge">미등록</span>
                  )}
                </td>

                {view === 'total' ? (
                  <>
                    <td className="ap-cell-num">{row.reviewCount || '—'}</td>
                    <td className="ap-cell-pts-review">
                      {row.reviewCount > 0 ? `${reviewPts(row).toLocaleString()}P` : '—'}
                    </td>
                    <td className="ap-cell-num">{row.inviteCount || '—'}</td>
                    <td className="ap-cell-pts-invite">
                      {row.inviteCount > 0 ? `${invitePts(row).toLocaleString()}P` : '—'}
                    </td>
                    <td className="ap-cell-pts-total">
                      <strong>{row.points.toLocaleString()}P</strong>
                    </td>
                  </>
                ) : (
                  <>
                    {view !== 'invite' && (
                      <td className="ap-cell-num ap-cell-metric--primary">{row.reviewCount}</td>
                    )}
                    {view !== 'review' && (
                      <td className="ap-cell-num ap-cell-metric--primary">{row.inviteCount}</td>
                    )}
                    <td>
                      <strong className={`ap-table-pts ap-table-pts--${view}`}>
                        {(view === 'review' ? reviewPts(row) : invitePts(row)).toLocaleString()}P
                      </strong>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
