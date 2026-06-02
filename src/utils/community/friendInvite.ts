import type { FriendInvite } from '../../types/community';

/** JSONBin·localStorage에서 읽은 초대 레코드 정규화 */
export function normalizeFriendInvite(raw: unknown): FriendInvite | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === 'string' ? o.id : '';
  const nickname = typeof o.nickname === 'string' ? o.nickname.trim() : '';
  const createdAt = typeof o.createdAt === 'string' ? o.createdAt : '';
  if (!id || !nickname || !createdAt) return null;

  const invitee =
    typeof o.inviteeNickname === 'string' ? o.inviteeNickname.trim() : '';

  return {
    id,
    nickname,
    inviteeNickname: invitee || undefined,
    createdAt,
  };
}

export function normalizeFriendInvites(list: unknown): FriendInvite[] {
  if (!Array.isArray(list)) return [];
  return list
    .map(normalizeFriendInvite)
    .filter((inv): inv is FriendInvite => inv !== null);
}

export function displayInviteeNickname(inv: FriendInvite): string {
  const name = inv.inviteeNickname?.trim();
  return name || '—';
}

export function formatInviteDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ko-KR', {
    year:   'numeric',
    month:  'numeric',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}
