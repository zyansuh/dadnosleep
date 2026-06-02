import { useCallback, useState } from 'react';
import type { AdminResetKind } from '../../constants/adminTestReset';
import { ADMIN_RESET_ACTIONS } from '../../constants/adminTestReset';
import {
  adminResetAllCommunityData,
  adminResetInvitesOnly,
  adminResetReviewsOnly,
} from '../../utils/community/communityStore';
import { toUserFacingError } from '../../utils/messages/userMessages';

async function executeReset(kind: AdminResetKind) {
  if (kind === 'reviews') return adminResetReviewsOnly();
  if (kind === 'invites') return adminResetInvitesOnly();
  return adminResetAllCommunityData();
}

export function useAdminTestReset() {
  const [pendingKind, setPendingKind] = useState<AdminResetKind | null>(null);
  const [resetting, setResetting]     = useState(false);
  const [feedback, setFeedback]       = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState(false);

  const requestReset = useCallback((kind: AdminResetKind) => {
    setPendingKind(kind);
  }, []);

  const cancelReset = useCallback(() => {
    if (!resetting) setPendingKind(null);
  }, [resetting]);

  const confirmReset = useCallback(async (kind: AdminResetKind) => {
    setResetting(true);
    setFeedback(null);
    setFeedbackError(false);

    const result = await executeReset(kind);
    const config = ADMIN_RESET_ACTIONS.find(a => a.kind === kind);

    setResetting(false);
    setPendingKind(null);
    setFeedback(
      result.ok
        ? (config?.successMessage ?? '초기화했습니다.')
        : toUserFacingError(result.message),
    );
    setFeedbackError(!result.ok);
  }, []);

  return {
    actions:        ADMIN_RESET_ACTIONS,
    pendingKind,
    resetting,
    feedback,
    feedbackError,
    requestReset,
    cancelReset,
    confirmReset,
  };
}
