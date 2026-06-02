import { useAdminTestReset } from '../../../hooks/admin/useAdminTestReset';
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

        {reset.feedback && (
          <p className={`admin-alert ${reset.feedbackError ? 'admin-alert-error' : 'admin-alert-ok'}`}>
            {reset.feedback}
          </p>
        )}
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
