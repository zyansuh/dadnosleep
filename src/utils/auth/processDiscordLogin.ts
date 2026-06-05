import { isAdminDiscordUsername } from '../../constants/adminUsers';
import type { DiscordLoginProfile, LoginProcessResult } from '../../types/member';
import { resolveNickname } from '../nickname';
import { findMember } from '../members/memberIdentity';
import { loadMembersBin, syncMemberOnLogin } from '../members/membersStore';

export async function processDiscordLogin(
  profile: DiscordLoginProfile,
): Promise<LoginProcessResult> {
  // 명단에 있으면 Discord ID 연결 (관리자 계정 포함)
  await syncMemberOnLogin(profile);

  if (isAdminDiscordUsername(profile.username)) {
    return {
      role:     'admin',
      nickname: resolveNickname(null, profile.global_name, profile.username),
      isVip:    true,
      profile,
    };
  }

  const bin = await loadMembersBin();
  const member = findMember(bin.members, {
    discordId:  profile.id,
    username:   profile.username,
    globalName: profile.global_name,
  });

  if (!member) {
    return {
      role:     'guest',
      nickname: resolveNickname(null, profile.global_name, profile.username),
      isVip:    false,
      profile,
    };
  }

  return {
    role:     'member',
    nickname: resolveNickname(member.nickname, member.globalName, member.username),
    isVip:    member.isVip,
    profile,
  };
}
