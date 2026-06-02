const NICKNAME_RE = /^[a-zA-Z0-9_\u3131-\u318E\uAC00-\uD7A3]+$/;
const LS_MY_NICKNAME = 'dadnosleep-my-nickname';

/** 커뮤니티 후기 작성 시 본인 닉네임 식별용 */
export function saveMyNickname(nickname: string): void {
  try {
    localStorage.setItem(LS_MY_NICKNAME, nickname.trim());
  } catch { /* 무시 */ }
}

export function getMyNickname(): string | null {
  try {
    return localStorage.getItem(LS_MY_NICKNAME);
  } catch {
    return null;
  }
}

export function isMyReview(reviewNickname: string): boolean {
  const mine = getMyNickname();
  return !!mine && mine === reviewNickname;
}

export function validateNickname(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 2) return '닉네임은 2자 이상이어야 합니다.';
  if (trimmed.length > 20) return '닉네임은 20자 이하여야 합니다.';
  if (!NICKNAME_RE.test(trimmed)) {
    return '한글, 영문, 숫자, 언더스코어(_)만 사용할 수 있습니다.';
  }
  return null;
}

export function resolveNickname(
  nickname: string | undefined | null,
  globalName: string | null | undefined,
  username: string,
): string {
  const n = nickname?.trim();
  if (n) return n;
  const g = globalName?.trim();
  if (g) return g;
  return username;
}
