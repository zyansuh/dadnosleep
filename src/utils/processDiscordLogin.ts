import { isAdminDiscordUsername } from '../constants/adminUsers';
import type { DiscordLoginProfile, LoginProcessResult } from '../types/member';
import { resolveNickname } from './nickname';
import { findMemberByDiscordId, loadMembersBin, syncMemberOnLogin } from './membersStore';

export async function processDiscordLogin(
  profile: DiscordLoginProfile,
): Promise<LoginProcessResult> {
  if (isAdminDiscordUsername(profile.username)) {
    return {
      role:     'admin',
      nickname: resolveNickname(null, profile.global_name, profile.username),
      profile,
    };
  }

  const bin = await loadMembersBin();
  const existing = findMemberByDiscordId(bin.members, profile.id);

  if (!existing) {
    return {
      role:     'guest',
      nickname: resolveNickname(null, profile.global_name, profile.username),
      profile,
    };
  }

  const synced = await syncMemberOnLogin(profile);
  const member = synced ?? existing;

  return {
    role:     'member',
    nickname: resolveNickname(member.nickname, member.globalName, member.username),
    profile,
  };
}
