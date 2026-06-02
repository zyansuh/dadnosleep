export const REVIEW_CARD_COLORS = [
  'linear-gradient(135deg, #1e1040, #2d1b69)',
  'linear-gradient(135deg, #1a0a30, #4a1942)',
  'linear-gradient(135deg, #0d1b2a, #1b3a5c)',
  'linear-gradient(135deg, #1a1a2e, #16213e)',
  'linear-gradient(135deg, #2d0a0a, #5c1c1c)',
] as const;

export function starText(rating: number): string {
  return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
}

export function reviewTimeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}
