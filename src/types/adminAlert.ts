export type AdminAlertVariant = 'ok' | 'error' | 'warn';

export interface AdminFeedbackState {
  message: string;
  variant: AdminAlertVariant;
}
