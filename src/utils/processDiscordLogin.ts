import { isAdminDiscordUsername } from '../constants/adminUsers';
import type { DiscordLoginProfile, LoginProcessResult } from '../types/member';
import { resolveNickname } from './nickname';
import { findMember } from './memberIdentity';
import { loadMembersBin, syncMemberOnLogin } from './membersStore';

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
  const existing = findMember(bin.members, { discordId: profile.id, username: profile.username });

  if (!existing) {
    return {
      role:     'guest',
      nickname: resolveNickname(null, profile.global_name, profile.username),
      profile,
    };
  }

  const synced = await syncMemberOnLogin(profile);
  const member = synced ?? existing ?? findMember(bin.members, { username: profile.username });

  if (!member) {
    return {
      role:     'guest',
      nickname: resolveNickname(null, profile.global_name, profile.username),
      profile,
    };
  }

  return {
    role:     'member',
    nickname: resolveNickname(member.nickname, member.globalName, member.username),
    profile,
  };
}
