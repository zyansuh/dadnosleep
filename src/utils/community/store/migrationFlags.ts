import { LS_REVIEWS_MIGRATED } from './constants';

export function isMigrated(): boolean {
  try {
    return localStorage.getItem(LS_REVIEWS_MIGRATED) === '1';
  } catch {
    return false;
  }
}

export function markMigrated(): void {
  try {
    localStorage.setItem(LS_REVIEWS_MIGRATED, '1');
  } catch { /* 무시 */ }
}
