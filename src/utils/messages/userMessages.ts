/** 화면에 노출되는 오류 문구에서 개발·설정 용어를 일반 안내로 바꿉니다. */
export function toUserFacingError(message: string): string {
  const m = message.trim();
  if (!m) return '처리에 실패했습니다. 잠시 후 다시 시도해 주세요.';

  if (/VITE_|JSONBin|Access Key|Bin ID|localStorage|members\)|\(members|snowflake/i.test(m)) {
    if (/설정되지 않|필요|미설정|연결되지 않/i.test(m)) {
      return '저장소가 연결되지 않았습니다. 사이트 운영 담당자에게 문의해 주세요.';
    }
    if (/401|유효하지 않|권한/i.test(m)) {
      return '저장소 접근에 실패했습니다. 운영 담당자에게 문의해 주세요.';
    }
    return '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  }

  if (/Vercel 환경변수/i.test(m)) {
    return '콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
  }

  return m;
}
