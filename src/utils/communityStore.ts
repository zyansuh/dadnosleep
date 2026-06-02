import type { Review, PointRecord } from '../types/community';
import type { MemberEntry } from '../types/member';
import { getCommunityBinId, hasJsonBinAccessKey } from './jsonbinEnv';
import { fetchJsonBinRecord, putJsonBinRecord } from './jsonbinRecord';

export const LS_REVIEWS          = 'dadnosleep-reviews-v1';
export const LS_POINTS           = 'dadnosleep-points-v1';
export const LS_REVIEWS_MIGRATED = 'reviews_migrated';

export interface CommunityData {
  reviews: Review[];
  points:  PointRecord[];
}

export interface PersistResult {
  data:    CommunityData;
  offline: boolean;
}

type RemoteFailReason = 'unconfigured' | 'network' | 'rate_limit' | 'server_error' | 'client_error';

type RemoteResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: RemoteFailReason };

const BIN_ID = getCommunityBinId();

export const hasRemoteStore = Boolean(BIN_ID && hasJsonBinAccessKey());

function isMigrated(): boolean {
  try {
    return localStorage.getItem(LS_REVIEWS_MIGRATED) === '1';
  } catch {
    return false;
  }
}

function markMigrated(): void {
  try {
    localStorage.setItem(LS_REVIEWS_MIGRATED, '1');
  } catch { /* 무시 */ }
}

function readLocal(): CommunityData {
  try {
    const reviews = JSON.parse(localStorage.getItem(LS_REVIEWS) ?? '[]') as Review[];
    const points  = JSON.parse(localStorage.getItem(LS_POINTS)  ?? '[]') as PointRecord[];
    return { reviews, points };
  } catch {
    return { reviews: [], points: [] };
  }
}

function writeLocal(data: CommunityData): void {
  try {
    localStorage.setItem(LS_REVIEWS, JSON.stringify(data.reviews));
    localStorage.setItem(LS_POINTS,  JSON.stringify(data.points));
  } catch { /* 무시 */ }
}

function clearLegacyReviewKey(): void {
  try {
    localStorage.removeItem(LS_REVIEWS);
  } catch { /* 무시 */ }
}

export function mergeReviews(a: Review[], b: Review[]): Review[] {
  const map = new Map<string, Review>();
  for (const r of [...a, ...b]) map.set(r.id, r);
  return [...map.values()].sort(
    (x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime(),
  );
}

function mergePoints(a: PointRecord[], b: PointRecord[]): PointRecord[] {
  const map = new Map<string, PointRecord>();
  for (const p of [...a, ...b]) {
    const prev = map.get(p.nickname);
    if (!prev || p.points > prev.points) map.set(p.nickname, p);
  }
  return [...map.values()].sort((a, b) => b.points - a.points);
}

function mergeData(local: CommunityData, remote: CommunityData): CommunityData {
  return {
    reviews: mergeReviews(local.reviews, remote.reviews),
    points:  mergePoints(local.points, remote.points),
  };
}

async function fetchRemote(): Promise<RemoteResult<CommunityData>> {
  if (!hasRemoteStore) return { ok: false, reason: 'unconfigured' };
  try {
    const record = await fetchJsonBinRecord(BIN_ID);
    if (!Array.isArray(record.reviews) || !Array.isArray(record.points)) {
      return { ok: true, data: { reviews: [], points: [] } };
    }
    return { ok: true, data: { reviews: record.reviews, points: record.points } };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

async function saveRemote(data: CommunityData): Promise<RemoteResult<true>> {
  if (!hasRemoteStore) return { ok: false, reason: 'unconfigured' };
  try {
    let members: MemberEntry[] = [];
    try {
      const existing = await fetchJsonBinRecord(BIN_ID);
      if (Array.isArray(existing.members)) members = existing.members;
    } catch { /* members 필드 없으면 빈 배열 */ }

    await putJsonBinRecord(BIN_ID, {
      reviews: data.reviews,
      points:  data.points,
      members,
    });
    return { ok: true, data: true };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

/** localStorage 레거시 후기 → JSONBin 1회 마이그레이션 */
export async function migrateLegacyReviewsIfNeeded(): Promise<void> {
  if (isMigrated() || !hasRemoteStore) return;

  let legacyReviews: Review[] | null = null;
  try {
    if (localStorage.getItem(LS_REVIEWS) === null) {
      markMigrated();
      return;
    }
    legacyReviews = JSON.parse(localStorage.getItem(LS_REVIEWS) ?? '[]') as Review[];
    if (!Array.isArray(legacyReviews)) legacyReviews = [];
  } catch {
    clearLegacyReviewKey();
    markMigrated();
    return;
  }

  const legacyPoints = readLocal().points;
  const legacyData: CommunityData = { reviews: legacyReviews, points: legacyPoints };

  const remote = await fetchRemote();
  const merged = remote.ok
    ? mergeData(legacyData, remote.data)
    : legacyData;

  const saved = await saveRemote(merged);
  if (!saved.ok) return;

  clearLegacyReviewKey();
  writeLocal(merged);
  markMigrated();
}

/** 로컬 + 원격(JSONBin) 병합 조회 — 원격 실패 시 localStorage fallback */
export async function loadCommunityData(): Promise<CommunityData> {
  await migrateLegacyReviewsIfNeeded();

  const local = readLocal();
  const remote = await fetchRemote();

  if (!remote.ok) return local;

  const merged = mergeData(local, remote.data);
  writeLocal(merged);
  return merged;
}

/** 저장 — 원격 실패 시 localStorage만 사용 (offline: true) */
export async function persistCommunityData(data: CommunityData): Promise<PersistResult> {
  writeLocal(data);

  const saved = await saveRemote(data);
  if (!saved.ok) {
    return { data, offline: true };
  }

  const remote = await fetchRemote();
  if (!remote.ok) {
    return { data, offline: false };
  }

  const merged = mergeData(data, remote.data);
  writeLocal(merged);
  return { data: merged, offline: false };
}

export function recalcPoints(reviews: Review[], bonus = 1500): PointRecord[] {
  const counts = new Map<string, number>();
  for (const r of reviews) {
    counts.set(r.nickname, (counts.get(r.nickname) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([nickname, reviewCount]) => ({
      nickname,
      reviewCount,
      points: reviewCount * bonus,
    }))
    .sort((a, b) => b.points - a.points);
}
