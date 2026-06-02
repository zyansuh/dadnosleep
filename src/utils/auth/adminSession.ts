const SS_ADMIN      = 'isAdmin';
const SS_FAIL_COUNT = 'admin_fail_count';
const SS_LOCK_UNTIL = 'admin_lock_until';

const MAX_ATTEMPTS   = 5;
const LOCK_MS        = 30_000;

export function isAdminSession(): boolean {
  try {
    return sessionStorage.getItem(SS_ADMIN) === 'true';
  } catch {
    return false;
  }
}

export function setAdminSession(): void {
  try {
    sessionStorage.setItem(SS_ADMIN, 'true');
    sessionStorage.removeItem(SS_FAIL_COUNT);
    sessionStorage.removeItem(SS_LOCK_UNTIL);
  } catch { /* 무시 */ }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(SS_ADMIN);
  } catch { /* 무시 */ }
}

export function getLockRemainingMs(): number {
  try {
    const until = Number(sessionStorage.getItem(SS_LOCK_UNTIL) ?? 0);
    if (!until) return 0;
    const left = until - Date.now();
    if (left <= 0) {
      sessionStorage.removeItem(SS_LOCK_UNTIL);
      sessionStorage.removeItem(SS_FAIL_COUNT);
      return 0;
    }
    return left;
  } catch {
    return 0;
  }
}

export function recordFailedAttempt(): { locked: boolean; remainingMs: number; attemptsLeft: number } {
  if (getLockRemainingMs() > 0) {
    return { locked: true, remainingMs: getLockRemainingMs(), attemptsLeft: 0 };
  }

  try {
    const count = Number(sessionStorage.getItem(SS_FAIL_COUNT) ?? 0) + 1;
    sessionStorage.setItem(SS_FAIL_COUNT, String(count));

    if (count >= MAX_ATTEMPTS) {
      sessionStorage.setItem(SS_LOCK_UNTIL, String(Date.now() + LOCK_MS));
      sessionStorage.setItem(SS_FAIL_COUNT, '0');
      return { locked: true, remainingMs: LOCK_MS, attemptsLeft: 0 };
    }

    return { locked: false, remainingMs: 0, attemptsLeft: MAX_ATTEMPTS - count };
  } catch {
    return { locked: false, remainingMs: 0, attemptsLeft: MAX_ATTEMPTS };
  }
}

export function verifyAdminPassword(input: string): boolean {
  const expected = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;
  if (!expected) return false;
  return input === expected;
}
