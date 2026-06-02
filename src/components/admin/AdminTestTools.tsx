import { useState } from 'react';
import { RotateCcw, Trash2, UserPlus } from 'lucide-react';
import { ConfirmModal } from '../ConfirmModal';
import {
  adminResetAllCommunityData,
  adminResetInvitesOnly,
  adminResetReviewsOnly,
  hasRemoteStore,
} from '../../utils/community/communityStore';

type ResetKind = 'reviews' | 'invites' | 'all';

export function AdminTestTools() {
  const [resetKind, setResetKind] = useState<ResetKind | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetErr, setResetErr] = useState(false);

  const runReset = async (kind: ResetKind) => {
    setResetting(true);
    setResetMsg(null);
    setResetErr(false);
    let result;
    if (kind === 'reviews') result = await adminResetReviewsOnly();
    else if (kind === 'invites') result = await adminResetInvitesOnly();
    else result = await adminResetAllCommunityData();

    setResetting(false);
    setResetKind(null);
    const detail = kind === 'reviews'
      ? '후기만 삭제했습니다. 지인 초대 신고와 초대 포인트는 유지됩니다.'
      : kind === 'invites'
        ? '지인 초대 신고만 삭제했습니다. 후기와 후기 포인트는 유지됩니다.'
        : '후기·지인 초대·포인트를 모두 삭제했습니다.';
    setResetMsg(result.ok ? `${detail} ${result.message}` : result.message);
    setResetErr(!result.ok);
  };

  return (
    <>
      <section className="admin-test-panel">
        <h3 className="admin-test-title">테스트 도구</h3>
        <p className="admin-page-desc admin-test-desc">
          포인트는 후기(1,500P)와 지인 초대(2,000P) 건수로 자동 계산됩니다.
          회원 명단(JSONBin <code>members</code>)은 어떤 초기화에서도 유지됩니다.
          {!hasRemoteStore && (
            <> JSONBin이 없으면 이 브라우저 localStorage만 변경됩니다.</>
          )}
        </p>

        <div className="admin-test-actions">
          <button
            type="button"
            className="admin-reset-points-btn"
            disabled={resetting}
            onClick={() => setResetKind('reviews')}
          >
            <RotateCcw size={16} /> 후기만 초기화
          </button>
          <p className="admin-test-hint">
            후기만 삭제합니다. <strong>지인 초대 신고·초대 포인트는 유지</strong>됩니다.
          </p>

          <button
            type="button"
            className="admin-reset-invite-btn"
            disabled={resetting}
            onClick={() => setResetKind('invites')}
          >
            <UserPlus size={16} /> 지인 초대만 초기화
          </button>
          <p className="admin-test-hint">
            지인 초대 신고만 삭제합니다. <strong>후기·후기 포인트는 유지</strong>됩니다.
          </p>

          <button
            type="button"
            className="admin-reset-all-btn"
            disabled={resetting}
            onClick={() => setResetKind('all')}
          >
            <Trash2 size={16} /> 전체 초기화
          </button>
          <p className="admin-test-hint">
            후기·지인 초대·포인트 랭킹을 <strong>전부</strong> 비웁니다. 되돌릴 수 없습니다.
          </p>
        </div>

        {resetMsg && (
          <p className={`admin-alert ${resetErr ? 'admin-alert-error' : 'admin-alert-ok'}`}>
            {resetMsg}
          </p>
        )}
      </section>

      {resetKind === 'reviews' && (
        <ConfirmModal
          title="후기만 초기화"
          message="모든 후기를 삭제합니다. 지인 초대 신고는 삭제하지 않습니다. 계속할까요?"
          confirmLabel={resetting ? '처리 중…' : '초기화'}
          danger
          onConfirm={() => void runReset('reviews')}
          onClose={() => !resetting && setResetKind(null)}
        />
      )}

      {resetKind === 'invites' && (
        <ConfirmModal
          title="지인 초대만 초기화"
          message="지인 초대 신고 기록을 모두 삭제합니다. 후기는 삭제하지 않습니다. 계속할까요?"
          confirmLabel={resetting ? '처리 중…' : '초기화'}
          danger
          onConfirm={() => void runReset('invites')}
          onClose={() => !resetting && setResetKind(null)}
        />
      )}

      {resetKind === 'all' && (
        <ConfirmModal
          title="전체 초기화"
          message="후기, 지인 초대 신고, 포인트 랭킹을 모두 삭제합니다. 되돌릴 수 없습니다. 계속할까요?"
          confirmLabel={resetting ? '처리 중…' : '전체 삭제'}
          danger
          onConfirm={() => void runReset('all')}
          onClose={() => !resetting && setResetKind(null)}
        />
      )}
    </>
  );
}
