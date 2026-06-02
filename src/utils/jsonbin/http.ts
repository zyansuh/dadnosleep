export function classifyJsonBinStatus(status: number): string {
  if (status === 401) return '저장소 접근에 실패했습니다. 운영 담당자에게 문의해 주세요.';
  if (status === 404) return '저장소를 찾을 수 없습니다. 운영 담당자에게 문의해 주세요.';
  return '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}
