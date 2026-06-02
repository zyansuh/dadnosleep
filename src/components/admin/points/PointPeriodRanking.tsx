import type { PointPeriodView } from '../../../utils/community/pointPeriod';
import type { PointPeriodRow } from '../../../utils/community/pointPeriod';
import { PointPeriodTable } from './PointPeriodTable';
import { PointPeriodMobileList } from './PointPeriodMobileList';

const TITLES: Record<PointPeriodView, string> = {
  total:  '🏆 합산 랭킹',
  review: '✍️ 후기 포인트 랭킹',
  invite: '🤝 지인 초대 포인트 랭킹',
};

const EMPTY: Record<PointPeriodView, string> = {
  total:  '선택한 기간에 포인트 활동이 없습니다.',
  review: '선택한 기간에 작성된 후기가 없습니다.',
  invite: '선택한 기간에 지인 초대 신고가 없습니다.',
};

interface Props {
  view:            PointPeriodView;
  rows:            PointPeriodRow[];
  loading:         boolean;
  registeredOnly:  boolean;
  memberCount:     number;
}

export function PointPeriodRanking({
  view, rows, loading, registeredOnly, memberCount,
}: Props) {
  const emptyMessage =
    registeredOnly && memberCount === 0
      ? '등록된 회원이 없습니다. 회원 명단 관리에서 추가해 주세요.'
      : EMPTY[view];

  return (
    <section className={`ap-ranking ap-ranking--${view}`} aria-labelledby="ap-ranking-title">
      <header className="ap-ranking-hd">
        <h3 id="ap-ranking-title" className="ap-ranking-title">{TITLES[view]}</h3>
        <p className="ap-ranking-hint">
          {view === 'invite'
            ? '이 목록은 지인 초대 신고만 집계합니다. 후기 포인트는 포함되지 않습니다.'
            : view === 'review'
              ? '이 목록은 후기 작성만 집계합니다. 지인 초대 포인트는 포함되지 않습니다.'
              : '후기·지인 초대 건수와 포인트를 한 표에서 보고, 합산 열로 총점을 확인할 수 있습니다.'}
        </p>
      </header>
      <div className="ap-ranking-table ap-ranking-table--desktop">
        <PointPeriodTable
          view={view}
          rows={rows}
          loading={loading}
          registeredOnly={registeredOnly}
          memberCount={memberCount}
          emptyMessage={emptyMessage}
        />
      </div>
      <div className="ap-ranking-table ap-ranking-table--mobile">
        <PointPeriodMobileList
          view={view}
          rows={rows}
          loading={loading}
          emptyMessage={emptyMessage}
        />
      </div>
    </section>
  );
}
