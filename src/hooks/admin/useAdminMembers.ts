import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createMemberEntry,
  filterMembersByLink,
  getMemberRowKey,
  hasMembersRemote,
  isUsernameTaken,
  loadMembersBin,
  saveMembersBin,
  updateMemberFields,
  withdrawMember,
  type MemberEntry,
} from '../../utils/members/membersStore';
import type { MemberListFilter } from '../../components/admin/MemberListToolbar';
import { validateNickname } from '../../utils/nickname';
import { validateMemberIdentity } from '../../utils/members/memberIdentity';
import { displayMemberNickname } from '../../utils/members/memberDisplay';

export function useAdminMembers() {
  const [members, setMembers]           = useState<MemberEntry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [newUsername, setNewUsername]   = useState('');
  const [newNickname, setNewNickname]   = useState('');
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState<string | null>(null);
  const [editingKey, setEditingKey]     = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState('');
  const [withdrawTarget, setWithdrawTarget] = useState<MemberEntry | null>(null);
  const [listFilter, setListFilter]         = useState<MemberListFilter>('linked');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadMembersBin({ forAdmin: true });
      setMembers(
        [...data.members].sort(
          (a, b) => new Date(b.joinedAt || 0).getTime() - new Date(a.joinedAt || 0).getTime(),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filterCounts = useMemo(() => ({
    all:     members.length,
    linked:  members.filter(m => Boolean(m.discordId?.trim())).length,
    pending: members.filter(m => !m.discordId?.trim()).length,
  }), [members]);

  const filteredMembers = useMemo(
    () => filterMembersByLink(members, listFilter),
    [members, listFilter],
  );

  const persist = useCallback(async (next: MemberEntry[]) => {
    if (!hasMembersRemote()) {
      setError('JSONBin Access Key 또는 Bin ID가 설정되지 않았습니다.');
      return false;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await saveMembersBin({ members: next });
      setMembers(next);
      setSuccess('저장되었습니다.');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const handleAdd = useCallback(async () => {
    const username = newUsername.trim();
    const userErr = validateMemberIdentity(username);
    if (userErr) {
      setError(userErr);
      return;
    }
    const nickErr = newNickname.trim() ? validateNickname(newNickname) : null;
    if (nickErr) {
      setError(nickErr);
      return;
    }
    if (isUsernameTaken(members, username)) {
      setError('이미 등록된 식별 이름입니다.');
      return;
    }
    const entry = createMemberEntry({
      username,
      nickname: newNickname.trim() || undefined,
    });
    const ok = await persist([...members, entry]);
    if (ok) {
      setNewUsername('');
      setNewNickname('');
    }
  }, [members, newUsername, newNickname, persist]);

  const startEdit = useCallback((m: MemberEntry) => {
    setEditingKey(getMemberRowKey(m));
    setEditNickname(displayMemberNickname(m));
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingKey(null);
    setEditNickname('');
  }, []);

  const saveEdit = useCallback(async (m: MemberEntry) => {
    const err = validateNickname(editNickname);
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateMemberFields(
        { discordId: m.discordId || undefined, username: m.username },
        { nickname: editNickname.trim() },
      );
      setMembers(prev => prev.map(row =>
        getMemberRowKey(row) === getMemberRowKey(m)
          ? { ...row, nickname: editNickname.trim() }
          : row,
      ));
      setSuccess('닉네임이 수정되었습니다.');
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }, [editNickname, cancelEdit]);

  const confirmWithdraw = useCallback(async () => {
    if (!withdrawTarget) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await withdrawMember(withdrawTarget);
      setMembers(
        [...data.members].sort(
          (a, b) => new Date(b.joinedAt || 0).getTime() - new Date(a.joinedAt || 0).getTime(),
        ),
      );
      const parts = [
        `@${withdrawTarget.username} (${displayMemberNickname(withdrawTarget)}) 님을 탈퇴 처리했습니다.`,
      ];
      if (data.removedReviews > 0 || data.removedInvites > 0) {
        const detail: string[] = [];
        if (data.removedReviews > 0) detail.push(`후기 ${data.removedReviews}건`);
        if (data.removedInvites > 0) detail.push(`지인 초대 ${data.removedInvites}건`);
        parts.push(`포인트 관련 데이터 삭제: ${detail.join(', ')}`);
      } else {
        parts.push('삭제할 후기·지인 초대 기록이 없었습니다.');
      }
      setSuccess(parts.join(' '));
      setWithdrawTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '탈퇴 처리에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }, [withdrawTarget]);

  return {
    members,
    filteredMembers,
    listFilter,
    setListFilter,
    filterCounts,
    loading,
    saving,
    newUsername,
    setNewUsername,
    newNickname,
    setNewNickname,
    error,
    success,
    editingKey,
    editNickname,
    setEditNickname,
    withdrawTarget,
    setWithdrawTarget,
    hasRemote: hasMembersRemote,
    handleAdd,
    startEdit,
    cancelEdit,
    saveEdit,
    confirmWithdraw,
    displayMemberNickname,
  };
}
