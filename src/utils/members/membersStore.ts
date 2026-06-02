import type { MemberEntry, MembersBinRecord } from '../../types/member';
import { resolveNickname } from '../nickname';
import {
  findMemberIndex,
  getMemberRowKey,
  normalizeDiscordUsername,
} from './memberIdentity';
import { purgeCommunityDataForMember } from '../community/communityStore';
import { normalizeMemberIsVip } from './memberVip';
import { hasMembersBinConfigured } from '../jsonbin/jsonbinEnv';
import { loadMembersFromBin, saveMembersRecord } from '../jsonbin/jsonbinRecord';

export type { MemberEntry, MembersBinRecord };

export function hasMembersRemote(): boolean {
  return hasMembersBinConfigured();
}

function todayJoinedAt(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizeEntry(raw: unknown): MemberEntry | null {
  if (typeof raw === 'string' && raw.trim()) {
    const s = raw.trim();
    if (/^\d{17,20}$/.test(s)) {
      return {
        discordId:  s,
        username:   '',
        globalName: '',
        nickname:   '',
        avatar:     '',
        role:       'member',
        joinedAt:   todayJoinedAt(),
        isVip:      true,
      };
    }
    return {
      discordId:  '',
      username:   s,
      globalName: '',
      nickname:   '',
      avatar:     '',
      role:       'member',
      joinedAt:   todayJoinedAt(),
      isVip:      true,
    };
  }
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const discordId = typeof o.discordId === 'string' ? o.discordId.trim() : '';
  const username  = typeof o.username === 'string' ? o.username.trim() : '';
  if (!discordId && !username) return null;

  const globalName = typeof o.globalName === 'string'
    ? o.globalName
    : typeof o.global_name === 'string'
      ? o.global_name
      : '';
  const nickname = typeof o.nickname === 'string' ? o.nickname : '';
  const avatar   = typeof o.avatar === 'string' ? o.avatar : '';
  const joinedAt = typeof o.joinedAt === 'string'
    ? o.joinedAt
    : typeof o.addedAt === 'string'
      ? o.addedAt.slice(0, 10)
      : todayJoinedAt();

  return {
    discordId,
    username,
    globalName,
    nickname,
    avatar,
    role: 'member',
    joinedAt,
    isVip: normalizeMemberIsVip(o),
  };
}

function normalizeRecord(membersRaw: unknown[]): MemberEntry[] {
  return membersRaw
    .map(normalizeEntry)
    .filter((e): e is MemberEntry => e !== null);
}

export async function loadMembersBin(options?: { forAdmin?: boolean }): Promise<MembersBinRecord> {
  const configMsg =
    '회원 명단 저장소가 연결되지 않았습니다. 사이트 운영 담당자에게 문의해 주세요.';

  if (!hasMembersRemote()) {
    if (options?.forAdmin) throw new Error(configMsg);
    return { members: [] };
  }

  try {
    const raw = await loadMembersFromBin();
    return { members: normalizeRecord(raw) };
  } catch (e) {
    if (options?.forAdmin) {
      throw e instanceof Error ? e : new Error('회원 명단을 불러오지 못했습니다.');
    }
    return { members: [] };
  }
}

export async function saveMembersBin(data: MembersBinRecord): Promise<void> {
  if (!hasMembersRemote()) {
    throw new Error('회원 명단을 저장할 수 없습니다. 운영 담당자에게 문의해 주세요.');
  }
  await saveMembersRecord(data.members);
}

export function findMemberByDiscordId(
  members: MemberEntry[],
  discordId: string,
): MemberEntry | undefined {
  const idx = findMemberIndex(members, { discordId });
  return idx >= 0 ? members[idx] : undefined;
}

export function findMemberByUsername(
  members: MemberEntry[],
  username: string,
): MemberEntry | undefined {
  const idx = findMemberIndex(members, { username });
  return idx >= 0 ? members[idx] : undefined;
}

export function isDiscordIdInMembers(discordId: string, members: MemberEntry[]): boolean {
  return findMemberIndex(members, { discordId }) >= 0;
}

function patchMemberAt(
  data: MembersBinRecord,
  ref: { discordId?: string; username?: string },
  patch: Partial<MemberEntry>,
): number {
  const idx = findMemberIndex(data.members, ref);
  if (idx < 0) return -1;
  data.members[idx] = { ...data.members[idx], ...patch };
  return idx;
}

export async function updateMemberNickname(
  discordId: string,
  username: string,
  nickname: string,
): Promise<MembersBinRecord> {
  const data = await loadMembersBin();
  const idx = patchMemberAt(data, { discordId, username }, { nickname: nickname.trim() });
  if (idx < 0) throw new Error('회원 정보를 찾을 수 없습니다.');
  await saveMembersBin(data);
  return data;
}

export async function updateMemberFields(
  ref: { discordId?: string; username?: string },
  patch: Partial<Pick<MemberEntry, 'nickname' | 'username'>>,
): Promise<MembersBinRecord> {
  const data = await loadMembersBin();
  const idx = patchMemberAt(data, ref, patch);
  if (idx < 0) throw new Error('회원 정보를 찾을 수 없습니다.');
  await saveMembersBin(data);
  return data;
}

export async function syncMemberOnLogin(profile: {
  id:           string;
  username:     string;
  global_name?: string | null;
  avatar?:      string | null;
}): Promise<MemberEntry | null> {
  const data = await loadMembersBin();
  const idx = findMemberIndex(data.members, {
    discordId:  profile.id,
    username:   profile.username,
    globalName: profile.global_name,
  });
  if (idx < 0) return null;

  const existing = data.members[idx];
  const globalName = profile.global_name?.trim() ?? existing.globalName;
  const updated: MemberEntry = {
    ...existing,
    discordId:  profile.id,
    username:   profile.username,
    globalName,
    avatar:     profile.avatar ?? existing.avatar,
  };
  data.members[idx] = updated;
  await saveMembersBin(data);
  return updated;
}

export async function setMemberVip(
  entry: MemberEntry,
  isVip: boolean,
): Promise<MembersBinRecord> {
  const data = await loadMembersBin({ forAdmin: true });
  const idx = findMemberIndex(data.members, {
    discordId: entry.discordId || undefined,
    username:  entry.username,
  });
  if (idx < 0) throw new Error('회원을 찾을 수 없습니다.');
  data.members[idx] = { ...data.members[idx], isVip };
  await saveMembersBin(data);
  return data;
}

export function createMemberEntry(input: {
  username:   string;
  nickname?:  string;
  globalName?: string;
  discordId?: string;
  isVip?:     boolean;
}): MemberEntry {
  const username = input.username.trim();
  const globalName = input.globalName?.trim() ?? '';
  const nickname = input.nickname?.trim()
    || resolveNickname('', globalName || null, username);

  return {
    discordId:  input.discordId?.trim() ?? '',
    username,
    globalName,
    nickname,
    avatar:     '',
    role:       'member',
    joinedAt:   todayJoinedAt(),
    isVip:      input.isVip === true,
  };
}

export { getMemberRowKey };

export interface WithdrawMemberResult extends MembersBinRecord {
  removedReviews: number;
  removedInvites: number;
}

/** 명단 제거 + 해당 회원 후기·초대·포인트 전부 삭제 */
export async function withdrawMember(entry: MemberEntry): Promise<WithdrawMemberResult> {
  const purge = await purgeCommunityDataForMember(entry);

  const data = await loadMembersBin({ forAdmin: true });
  const key = getMemberRowKey(entry);
  const next = data.members.filter(m => getMemberRowKey(m) !== key);
  if (next.length === data.members.length) {
    throw new Error('회원을 찾을 수 없습니다.');
  }
  await saveMembersBin({ members: next });

  return {
    members: next,
    removedReviews: purge.removedReviews,
    removedInvites: purge.removedInvites,
  };
}

export function filterMembersByLink(
  members: MemberEntry[],
  mode: 'all' | 'linked' | 'pending' | 'vip',
): MemberEntry[] {
  if (mode === 'linked') return members.filter(m => Boolean(m.discordId?.trim()));
  if (mode === 'pending') return members.filter(m => !m.discordId?.trim());
  if (mode === 'vip') return members.filter(m => m.isVip);
  return members;
}

export function isUsernameTaken(members: MemberEntry[], username: string, exceptRowKey?: string): boolean {
  const target = normalizeDiscordUsername(username);
  return members.some(m => {
    if (exceptRowKey && getMemberRowKey(m) === exceptRowKey) return false;
    return normalizeDiscordUsername(m.username) === target;
  });
}
