export type UserRole = 'guest' | 'member' | 'admin';

/** @deprecated canAccessVipSchedule 사용 */
export function canAccessMemberContent(role: UserRole): boolean {
  return canAccessVipSchedule(role, true);
}

/** 회원 전용(VIP) 편성표 행 열람 */
export function canAccessVipSchedule(role: UserRole, isVip: boolean): boolean {
  if (role === 'admin') return true;
  return role === 'member' && isVip;
}
