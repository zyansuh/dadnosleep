export type UserRole = 'guest' | 'member' | 'admin';

export function canAccessMemberContent(role: UserRole): boolean {
  return role === 'member' || role === 'admin';
}
