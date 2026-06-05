import type { SuggestionStatus } from '../types/suggestion';

export const SUGGESTION_STATUS_LABELS: Record<SuggestionStatus, string> = {
  pending:   '접수',
  reviewing: '검토 중',
  answered:  '답변 완료',
  closed:    '종료',
};

export const SUGGESTION_CATEGORIES = ['드라마', '예능', '영화', '애니', '다큐', '기타'] as const;
