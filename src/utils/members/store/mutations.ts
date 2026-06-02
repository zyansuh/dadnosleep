import type { MemberEntry, MembersBinRecord } from '../../../types/member';
import { resolveNickname } from '../../nickname';
import { findMemberIndex } from '../memberIdentity';
import { loadMembersBin } from './load';
import { saveMembersBin } from './save';
import { patchMemberAt } from './patch';
import { todayJoinedAt } from './normalize';

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
