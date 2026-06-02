import { RefreshCw } from 'lucide-react';
import { PointPeriodToolbar } from '../../components/admin/points/PointPeriodToolbar';
import { PointPeriodViewTabs } from '../../components/admin/points/PointPeriodViewTabs';
import { PointPeriodSummary } from '../../components/admin/points/PointPeriodSummary';
import { PointPeriodRanking } from '../../components/admin/points/PointPeriodRanking';
import { FriendInviteLog } from '../../components/admin/points/FriendInviteLog';
import { AdminFeedbackBanner } from '../../components/admin/feedback/AdminFeedbackBanner';
import { useAdminPointReport } from '../../hooks/admin/useAdminPointReport';

export function AdminPointsPage() {
  const r = useAdminPointReport();

  return (
    <div className="admin-page-body ap-page">
      <div className="ap-page-hd">
        <div>
          <h2 className="admin-panel-title">기간별 포인트</h2>
          <p className="admin-page-desc ap-page-desc">
            탭으로 합산·후기·지인 초대 포인트를 나눠 볼 수 있습니다. 신고·작성 시각 기준으로 집계합니다.
          </p>
        </div>
        <button
          type="button"
          className="ap-refresh"
          disabled={r.loading}
          onClick={() => void r.reload()}
        >
          <RefreshCw size={16} className={r.loading ? 'spin' : ''} />
          새로고침
        </button>
      </div>

      <AdminFeedbackBanner feedback={r.feedback} />

      <PointPeriodToolbar
        preset={r.preset}
        customStart={r.customStart}
        customEnd={r.customEnd}
        registeredOnly={r.registeredOnly}
        onPresetChange={r.setPreset}
        onCustomStart={r.setCustomStart}
        onCustomEnd={r.setCustomEnd}
        onRegisteredOnly={r.setRegisteredOnly}
      />

      <PointPeriodViewTabs view={r.view} onChange={r.setView} />

      <PointPeriodSummary
        view={r.view}
        rangeLabel={r.range.label}
        displayPoints={r.displayPoints}
        activeCount={r.activeCount}
        periodReviewCount={r.periodReviewCount}
        periodInviteCount={r.periodInviteCount}
        totalReviewPoints={r.totalReviewPoints}
        totalInvitePoints={r.totalInvitePoints}
      />

      <PointPeriodRanking
        view={r.view}
        rows={r.rows}
        loading={r.loading}
        registeredOnly={r.registeredOnly}
        memberCount={r.memberCount}
      />

      {(r.view === 'invite' || r.view === 'total') && (
        <FriendInviteLog
          invites={r.periodInvites}
          loading={r.loading}
          rangeLabel={r.range.label}
        />
      )}
    </div>
  );
}
