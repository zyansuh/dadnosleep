export type MemberListFilter = 'all' | 'linked' | 'pending';

export function memberListEmptyMessage(filter: MemberListFilter): string {
  if (filter === 'linked') return '로그인한 회원이 없습니다. 「전체」 탭을 확인해 주세요.';
  if (filter === 'pending') return '로그인 전에 등록해 둔 회원이 없습니다.';
  return '등록된 회원이 없습니다. 위에서 추가해 주세요.';
}
