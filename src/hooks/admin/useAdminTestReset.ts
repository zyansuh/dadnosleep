import { useCallback, useState } from 'react';
import type { AdminResetKind } from '../../constants/adminTestReset';
import { ADMIN_RESET_ACTIONS } from '../../constants/adminTestReset';
import {
  adminResetAllCommunityData,
  adminResetInvitesOnly,
  adminResetPointsOnly,
  adminResetReviewsOnly,
} from '../../utils/community/communityStore';
import { toUserFacingError } from '../../utils/messages/userMessages';
import { useAdminFeedback } from './useAdminFeedback';

async function executeReset(kind: AdminResetKind) {
  if (kind === 'points') return adminResetPointsOnly();
  if (kind === 'reviews') return adminResetReviewsOnly();
  if (kind === 'invites') return adminResetInvitesOnly();
  return adminResetAllCommunityData();
}

export function useAdminTestReset() {
  const { feedback, clear, showOk, showError } = useAdminFeedback();
  const [pendingKind, setPendingKind] = useState<AdminResetKind | null>(null);
  const [resetting, setResetting]     = useState(false);

  const requestReset = useCallback((kind: AdminResetKind) => {
    setPendingKind(kind);
  }, []);

  const cancelReset = useCallback(() => {
    if (!resetting) setPendingKind(null);
  }, [resetting]);

  const confirmReset = useCallback(async (kind: AdminResetKind) => {
    setResetting(true);
    clear();

    const result = await executeReset(kind);
    const config = ADMIN_RESET_ACTIONS.find(a => a.kind === kind);

    setResetting(false);
    setPendingKind(null);

    if (result.ok) {
      showOk(config?.successMessage ?? '초기화했습니다.');
    } else {
      showError(toUserFacingError(result.message));
    }
  }, [clear, showOk, showError]);

  return {
    actions:        ADMIN_RESET_ACTIONS,
    pendingKind,
    resetting,
    feedback,
    requestReset,
    cancelReset,
    confirmReset,
  };
}
