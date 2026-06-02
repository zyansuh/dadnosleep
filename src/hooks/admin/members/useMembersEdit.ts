import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { getMemberRowKey, updateMemberFields, type MemberEntry } from '../../../utils/members/membersStore';
import { displayMemberNickname } from '../../../utils/members/memberDisplay';
import { validateNickname } from '../../../utils/nickname';
import { toUserFacingError } from '../../../utils/messages/userMessages';

interface FeedbackApi {
  clear:     () => void;
  showOk:    (message: string) => void;
  showError: (message: string) => void;
}

export function useMembersEdit(
  feedback: FeedbackApi,
  setMembers: Dispatch<SetStateAction<MemberEntry[]>>,
  setSaving: Dispatch<SetStateAction<boolean>>,
) {
  const [editingKey, setEditingKey]     = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState('');

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
      feedback.showError(err);
      return;
    }
    setSaving(true);
    feedback.clear();
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
      feedback.showOk('닉네임이 수정되었습니다.');
      cancelEdit();
    } catch (e) {
      feedback.showError(toUserFacingError(e instanceof Error ? e.message : '저장에 실패했습니다.'));
    } finally {
      setSaving(false);
    }
  }, [editNickname, cancelEdit, feedback, setMembers, setSaving]);

  return {
    editingKey,
    editNickname,
    setEditNickname,
    startEdit,
    cancelEdit,
    saveEdit,
  };
}
