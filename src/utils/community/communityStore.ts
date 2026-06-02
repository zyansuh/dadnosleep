import type { Review, PointRecord, FriendInvite } from '../../types/community';
import { getCommunityBinId, hasJsonBinAccessKey } from '../jsonbin/jsonbinEnv';
import { fetchJsonBinRecord, putJsonBinRecord } from '../jsonbin/jsonbinRecord';
import { recalcPoints } from './pointCalc';

export const LS_REVIEWS          = 'dadnosleep-reviews-v1';
export const LS_POINTS           = 'dadnosleep-points-v1';
export const LS_FRIEND_INVITES   = 'dadnosleep-friend-invites-v1';
export const LS_REVIEWS_MIGRATED = 'reviews_migrated';

export interface CommunityData {
  reviews:       Review[];
  points:        PointRecord[];
  friendInvites: FriendInvite[];
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

export { recalcPoints };

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
    const friendInvites = JSON.parse(
      localStorage.getItem(LS_FRIEND_INVITES) ?? '[]',
    ) as FriendInvite[];
    return { reviews, points, friendInvites };
  } catch {
    return { reviews: [], points: [], friendInvites: [] };
  }
}

function writeLocal(data: CommunityData): void {
  try {
    localStorage.setItem(LS_REVIEWS, JSON.stringify(data.reviews));
    localStorage.setItem(LS_POINTS,  JSON.stringify(data.points));
    localStorage.setItem(LS_FRIEND_INVITES, JSON.stringify(data.friendInvites));
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

export function mergeFriendInvites(a: FriendInvite[], b: FriendInvite[]): FriendInvite[] {
  const map = new Map<string, FriendInvite>();
  for (const inv of [...a, ...b]) map.set(inv.id, inv);
  return [...map.values()].sort(
    (x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime(),
  );
}

function mergeData(local: CommunityData, remote: CommunityData): CommunityData {
  const reviews = mergeReviews(local.reviews, remote.reviews);
  const friendInvites = mergeFriendInvites(local.friendInvites, remote.friendInvites);
  return {
    reviews,
    friendInvites,
    points: recalcPoints(reviews, friendInvites),
  };
}

function parseRemoteRecord(record: {
  reviews?:       unknown;
  points?:        unknown;
  friendInvites?: unknown;
}): CommunityData {
  const reviews = Array.isArray(record.reviews) ? record.reviews as Review[] : [];
  const friendInvites = Array.isArray(record.friendInvites)
    ? record.friendInvites as FriendInvite[]
    : [];
  return {
    reviews,
    friendInvites,
    points: recalcPoints(reviews, friendInvites),
  };
}

async function fetchRemote(): Promise<RemoteResult<CommunityData>> {
  if (!hasRemoteStore) return { ok: false, reason: 'unconfigured' };
  try {
    const record = await fetchJsonBinRecord(BIN_ID);
    return { ok: true, data: parseRemoteRecord(record) };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

async function saveRemote(data: CommunityData): Promise<RemoteResult<CommunityData>> {
  if (!hasRemoteStore) return { ok: false, reason: 'unconfigured' };
  try {
    const existing = await fetchJsonBinRecord(BIN_ID);
    const remoteReviews = Array.isArray(existing.reviews) ? existing.reviews as Review[] : [];
    const remoteInvites = Array.isArray(existing.friendInvites)
      ? existing.friendInvites as FriendInvite[]
      : [];
    const reviews = mergeReviews(remoteReviews, data.reviews);
    const friendInvites = mergeFriendInvites(remoteInvites, data.friendInvites);
    const points = recalcPoints(reviews, friendInvites);
    const hadMembers = Array.isArray(existing.members);
    const members = hadMembers ? existing.members! : [];

    await putJsonBinRecord(BIN_ID, {
      reviews,
      friendInvites,
      points,
      ...(hadMembers ? { members } : {}),
    });
    return { ok: true, data: { reviews, friendInvites, points } };
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

  const local = readLocal();
  const legacyData: CommunityData = {
    reviews:       legacyReviews,
    friendInvites: local.friendInvites,
    points:        local.points,
  };

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

  if (!remote.ok) {
    const points = recalcPoints(local.reviews, local.friendInvites);
    return { ...local, points };
  }

  const merged = mergeData(local, remote.data);
  writeLocal(merged);
  return merged;
}

/** 저장 — 원격 실패 시 localStorage만 사용 (offline: true) */
export async function persistCommunityData(data: CommunityData): Promise<PersistResult> {
  const withPoints: CommunityData = {
    ...data,
    points: recalcPoints(data.reviews, data.friendInvites),
  };
  writeLocal(withPoints);

  const saved = await saveRemote(withPoints);
  if (!saved.ok) {
    return { data: withPoints, offline: true };
  }

  writeLocal(saved.data);
  return { data: saved.data, offline: false };
}

async function adminWriteCommunityRecord(
  reviews: Review[],
  friendInvites: FriendInvite[],
): Promise<{ ok: boolean; message: string }> {
  const points = recalcPoints(reviews, friendInvites);
  const data: CommunityData = { reviews, friendInvites, points };
  writeLocal(data);

  if (!hasRemoteStore) {
    return { ok: true, message: '이 브라우저에 반영했습니다. (JSONBin 미설정)' };
  }

  try {
    const existing = await fetchJsonBinRecord(BIN_ID);
    const hadMembers = Array.isArray(existing.members);
    await putJsonBinRecord(BIN_ID, {
      reviews,
      friendInvites,
      points,
      ...(hadMembers ? { members: existing.members! } : {}),
    });
    return { ok: true, message: 'JSONBin에 반영했습니다. 회원 명단(members)은 그대로입니다.' };
  } catch (e) {
    return {
      ok:      false,
      message: e instanceof Error ? e.message : '저장에 실패했습니다.',
    };
  }
}

/**
 * 테스트용 — 후기만 삭제. 지인 초대 기록은 유지하고 포인트는 초대분만 남깁니다.
 */
export async function adminResetReviewsOnly(): Promise<{ ok: boolean; message: string }> {
  const local = readLocal();
  const friendInvites = local.friendInvites;

  if (!hasRemoteStore) {
    return adminWriteCommunityRecord([], friendInvites);
  }

  try {
    const existing = await fetchJsonBinRecord(BIN_ID);
    const remoteInvites = Array.isArray(existing.friendInvites)
      ? existing.friendInvites as FriendInvite[]
      : [];
    const mergedInvites = mergeFriendInvites(local.friendInvites, remoteInvites);
    return adminWriteCommunityRecord([], mergedInvites);
  } catch (e) {
    return {
      ok:      false,
      message: e instanceof Error ? e.message : '초기화에 실패했습니다.',
    };
  }
}

/**
 * 테스트용 — 지인 초대 신고만 삭제. 후기는 유지하고 포인트는 후기분만 남깁니다.
 */
export async function adminResetInvitesOnly(): Promise<{ ok: boolean; message: string }> {
  const local = readLocal();
  const reviews = local.reviews;

  if (!hasRemoteStore) {
    return adminWriteCommunityRecord(reviews, []);
  }

  try {
    const existing = await fetchJsonBinRecord(BIN_ID);
    const remoteReviews = Array.isArray(existing.reviews) ? existing.reviews as Review[] : [];
    const mergedReviews = mergeReviews(local.reviews, remoteReviews);
    return adminWriteCommunityRecord(mergedReviews, []);
  } catch (e) {
    return {
      ok:      false,
      message: e instanceof Error ? e.message : '초기화에 실패했습니다.',
    };
  }
}

/**
 * 테스트용 — 후기·지인초대·포인트 전부 삭제 (병합 없음).
 */
export async function adminResetAllCommunityData(): Promise<{ ok: boolean; message: string }> {
  return adminWriteCommunityRecord([], []);
}
