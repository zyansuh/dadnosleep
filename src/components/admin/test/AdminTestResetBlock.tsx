import type { AdminResetActionConfig } from '../../../constants/adminTestReset';

interface Props {
  action:     AdminResetActionConfig;
  disabled:   boolean;
  onRequest:  () => void;
}

export function AdminTestResetBlock({ action, disabled, onRequest }: Props) {
  const Icon = action.icon;
  return (
    <div className="admin-test-block">
      <button
        type="button"
        className={action.buttonClass}
        disabled={disabled}
        onClick={onRequest}
      >
        <Icon size={16} /> {action.label}
      </button>
      <p className="admin-test-hint">{action.hint}</p>
    </div>
  );
}
