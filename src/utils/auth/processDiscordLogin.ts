import { isAdminDiscordUsername } from '../../constants/adminUsers';
import type { DiscordLoginProfile, LoginProcessResult } from '../../types/member';
import { resolveNickname } from '../nickname';
import { findMember, findMemberIndexForProfile } from '../members/memberIdentity';
import { loadMembersBin, syncMemberOnLogin } from '../members/membersStore';

export async function processDiscordLogin(
  profile: DiscordLoginProfile,
): Promise<LoginProcessResult> {
  if (isAdminDiscordUsername(profile.username)) {
    return {
      role:     'admin',
      nickname: resolveNickname(null, profile.global_name, profile.username),
      isVip:    true,
      profile,
    };
  }

  const bin = await loadMembersBin();
  const existingIdx = findMemberIndexForProfile(bin.members, profile);
  const existing = existingIdx >= 0 ? bin.members[existingIdx] : undefined;

  if (!existing) {
    return {
      role:     'guest',
      nickname: resolveNickname(null, profile.global_name, profile.username),
      isVip:    false,
      profile,
    };
  }

  const synced = await syncMemberOnLogin(profile);
  const member = synced ?? existing ?? findMember(bin.members, {
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
