import type { MemberEntry, MembersBinRecord } from '../types/member';
import { resolveNickname } from './nickname';
import { hasMembersBinConfigured } from './jsonbinEnv';
import { loadMembersFromBin, saveMembersRecord } from './jsonbinRecord';

export type { MemberEntry, MembersBinRecord };

export const hasMembersRemote = hasMembersBinConfigured;

function todayJoinedAt(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizeEntry(raw: unknown): MemberEntry | null {
  if (typeof raw === 'string' && raw.trim()) {
    return {
      discordId:  raw.trim(),
      username:   '',
      globalName: '',
      nickname:   '',
      avatar:     '',
      role:       'member',
      joinedAt:   todayJoinedAt(),
    };
  }
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const discordId = typeof o.discordId === 'string' ? o.discordId.trim() : '';
  if (!discordId) return null;

  const username   = typeof o.username === 'string' ? o.username : '';
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
  };
}

function normalizeRecord(membersRaw: unknown[]): MemberEntry[] {
  return membersRaw
    .map(normalizeEntry)
    .filter((e): e is MemberEntry => e !== null);
}

export async function loadMembersBin(): Promise<MembersBinRecord> {
  if (!hasMembersRemote) return { members: [] };

  try {
    const raw = await loadMembersFromBin();
    return { members: normalizeRecord(raw) };
  } catch {
    return { members: [] };
  }
}

export async function saveMembersBin(data: MembersBinRecord): Promise<void> {
  if (!hasMembersRemote) {
    throw new Error('VITE_JSONBIN_ACCESS_KEY와 Bin ID(VITE_JSONBIN_BIN_MEMBERS 또는 VITE_JSONBIN_BIN_ID)가 필요합니다.');
  }
  await saveMembersRecord(data.members);
}

export function findMemberByDiscordId(
  members: MemberEntry[],
  discordId: string,
): MemberEntry | undefined {
  return members.find(m => m.discordId === discordId);
}

export function isDiscordIdInMembers(discordId: string, members: MemberEntry[]): boolean {
  return members.some(m => m.discordId === discordId);
}

export async function updateMemberNickname(
  discordId: string,
  nickname: string,
): Promise<MembersBinRecord> {
  const data = await loadMembersBin();
  const idx = data.members.findIndex(m => m.discordId === discordId);
  if (idx < 0) throw new Error('회원 정보를 찾을 수 없습니다.');
  data.members[idx] = { ...data.members[idx], nickname: nickname.trim() };
  await saveMembersBin(data);
  return data;
}

export async function updateMemberFields(
  discordId: string,
  patch: Partial<Pick<MemberEntry, 'nickname' | 'username'>>,
): Promise<MembersBinRecord> {
  const data = await loadMembersBin();
  const idx = data.members.findIndex(m => m.discordId === discordId);
  if (idx < 0) throw new Error('회원 정보를 찾을 수 없습니다.');
  data.members[idx] = { ...data.members[idx], ...patch };
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
  const idx = data.members.findIndex(m => m.discordId === profile.id);
  if (idx < 0) return null;

  const existing = data.members[idx];
  const globalName = profile.global_name?.trim() ?? existing.globalName;
  const updated: MemberEntry = {
    ...existing,
    username:   profile.username,
    globalName,
    avatar:     profile.avatar ?? existing.avatar,
  };
  data.members[idx] = updated;
  await saveMembersBin(data);
  return updated;
}

export function createMemberEntry(input: {
  discordId:  string;
  username:   string;
  nickname?:  string;
  globalName?: string;
}): MemberEntry {
  const globalName = input.globalName?.trim() ?? '';
  const nickname = input.nickname?.trim()
    || resolveNickname('', globalName || null, input.username);

  return {
    discordId:  input.discordId.trim(),
    username:   input.username.trim(),
    globalName,
    nickname,
    avatar:     '',
    role:       'member',
    joinedAt:   todayJoinedAt(),
  };
}
