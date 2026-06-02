import type { AdminFeedbackState } from '../../../types/adminAlert';
import { AdminAlert } from './AdminAlert';

interface Props {
  /** 동적 결과 (저장·초기화 등) */
  feedback?: AdminFeedbackState | null;
  /** 상시 경고 (저장소 미연결 등) */
  warn?:     string | null;
}

/** 관리자 페이지 상단 알림 영역 */
export function AdminFeedbackBanner({ feedback, warn }: Props) {
  const hasWarn = Boolean(warn?.trim());
  const hasFeedback = Boolean(feedback?.message?.trim());
  if (!hasWarn && !hasFeedback) return null;

  return (
    <div className="admin-feedback-banner">
      {hasWarn && <AdminAlert message={warn} variant="warn" />}
      {hasFeedback && <AdminAlert feedback={feedback} />}
    </div>
  );
}
