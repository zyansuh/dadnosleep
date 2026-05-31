/** 조회수 숫자 → 한국어 단위 변환 */
export function fmtViews(n?: string): string {
  if (!n) return '';
  const num = parseInt(n, 10);
  if (num >= 100_000_000) return `${Math.round(num / 100_000_000)}억회`;
  if (num >= 10_000)      return `${Math.round(num / 10_000)}만회`;
  return num.toLocaleString() + '회';
}
