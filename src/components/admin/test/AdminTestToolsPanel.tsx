import { useAdminTestReset } from '../../../hooks/admin/useAdminTestReset';
import { AdminFeedbackBanner } from '../feedback/AdminFeedbackBanner';
import { AdminTestResetBlock } from './AdminTestResetBlock';
import { AdminTestResetModals } from './AdminTestResetModals';

export function AdminTestToolsPanel() {
  const reset = useAdminTestReset();

  return (
    <>
      <section className="admin-test-panel">
        <h3 className="admin-test-title">테스트 도구</h3>
        <p className="admin-page-desc admin-test-desc">
          포인트는 후기(1,500P)와 지인 초대(2,000P) 건수로 자동 계산됩니다.
          <strong>포인트만 초기화</strong>하면 후기·초대 글은 남고 랭킹만 0이 됩니다.
          어떤 초기화를 해도 <strong>회원 명단</strong>은 삭제되지 않습니다.
        </p>

        <div className="admin-test-actions">
          {reset.actions.map(action => (
            <AdminTestResetBlock
              key={action.kind}
              action={action}
              disabled={reset.resetting}
              onRequest={() => reset.requestReset(action.kind)}
            />
          ))}
        </div>

        <AdminFeedbackBanner feedback={reset.feedback} />
      </section>

      <AdminTestResetModals
        actions={reset.actions}
        pendingKind={reset.pendingKind}
        resetting={reset.resetting}
        onConfirm={reset.confirmReset}
        onClose={reset.cancelReset}
      />
    </>
  );
}
