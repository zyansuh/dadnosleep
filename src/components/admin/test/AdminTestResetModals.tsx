import { ConfirmModal } from '../../ConfirmModal';
import type { AdminResetActionConfig, AdminResetKind } from '../../../constants/adminTestReset';

interface Props {
  actions:      AdminResetActionConfig[];
  pendingKind:  AdminResetKind | null;
  resetting:    boolean;
  onConfirm:    (kind: AdminResetKind) => void;
  onClose:      () => void;
}

export function AdminTestResetModals({
  actions, pendingKind, resetting, onConfirm, onClose,
}: Props) {
  const action = actions.find(a => a.kind === pendingKind);
  if (!action) return null;

  return (
    <ConfirmModal
      title={action.modalTitle}
      message={action.modalMessage}
      confirmLabel={resetting ? '처리 중…' : action.confirmLabel}
      danger
      onConfirm={() => void onConfirm(action.kind)}
      onClose={onClose}
    />
  );
}
