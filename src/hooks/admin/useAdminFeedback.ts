import { useCallback, useState } from 'react';
import type { AdminAlertVariant, AdminFeedbackState } from '../../types/adminAlert';

export function useAdminFeedback() {
  const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null);

  const clear = useCallback(() => {
    setFeedback(null);
  }, []);

  const show = useCallback((message: string, variant: AdminAlertVariant) => {
    setFeedback({ message, variant });
  }, []);

  const showOk = useCallback((message: string) => {
    show(message, 'ok');
  }, [show]);

  const showError = useCallback((message: string) => {
    show(message, 'error');
  }, [show]);

  const showWarn = useCallback((message: string) => {
    show(message, 'warn');
  }, [show]);

  return {
    feedback,
    clear,
    show,
    showOk,
    showError,
    showWarn,
  };
}
