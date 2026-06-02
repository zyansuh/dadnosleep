import type { AdminAlertVariant, AdminFeedbackState } from '../../../types/adminAlert';

interface Props {
  feedback?: AdminFeedbackState | null;
  message?:  string | null;
  variant?:  AdminAlertVariant;
  className?: string;
}

export function AdminAlert({
  feedback,
  message,
  variant = 'ok',
  className,
}: Props) {
  const text = feedback?.message ?? message;
  const tone = feedback?.variant ?? variant;
  if (!text?.trim()) return null;

  return (
    <p
      className={['admin-alert', `admin-alert-${tone}`, className].filter(Boolean).join(' ')}
      role="alert"
    >
      {text}
    </p>
  );
}
