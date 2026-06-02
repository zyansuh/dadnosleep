import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import {
  createMemberEntry,
  hasMembersRemote,
  isUsernameTaken,
  saveMembersBin,
  setMemberVip,
  withdrawMember,
  type MemberEntry,
} from '../../../utils/members/membersStore';
import { validateNickname } from '../../../utils/nickname';
import { validateMemberIdentity } from '../../../utils/members/memberIdentity';
import { displayMemberNickname } from '../../../utils/members/memberDisplay';
import { getDiscordSession, setSessionVip } from '../../../utils/auth/discordSession';
import { toUserFacingError } from '../../../utils/messages/userMessages';
import { sortMembersByJoinedDesc } from './sortMembers';

interface FeedbackApi {
  clear:     () => void;
  showOk:    (message: string) => void;
  showError: (message: string) => void;
}

interface AddFormApi {
  newUsername: string;
  newNickname: string;
  newIsVip:    boolean;
  resetForm:   () => void;
}

export function useMembersMutations(
  feedback: FeedbackApi,
  members: MemberEntry[],
  setMembers: Dispatch<SetStateAction<MemberEntry[]>>,
) {
  const [saving, setSaving] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<MemberEntry | null>(null);

  const persist = useCallback(async (next: MemberEntry[]) => {
    if (!hasMembersRemote()) {
      feedback.showError('지금은 명단을 저장할 수 없습니다. 사이트 운영 담당자에게 문의해 주세요.');
      return false;
    }
    setSaving(true);
    feedback.clear();
    try {
      await saveMembersBin({ members: next });
      setMembers(next);
      feedback.showOk('저장되었습니다.');
      return true;
    } catch (e) {
      feedback.showError(toUserFacingError(e instanceof Error ? e.message : '저장에 실패했습니다.'));
      return false;
    } finally {
      setSaving(false);
    }
  }, [feedback, setMembers]);

  const handleAdd = useCallback(async (form: AddFormApi) => {
    const username = form.newUsername.trim();
    const userErr = validateMemberIdentity(username);
    if (userErr) {
      feedback.showError(userErr);
      return;
    }
    const nickErr = form.newNickname.trim() ? validateNickname(form.newNickname) : null;
    if (nickErr) {
      feedback.showError(nickErr);
      return;
    }
    if (isUsernameTaken(members, username)) {
      feedback.showError('이미 등록된 식별 이름입니다.');
      return;
    }
    const entry = createMemberEntry({
      username,
      nickname: form.newNickname.trim() || undefined,
      isVip:    form.newIsVip,
    });
    const ok = await persist([...members, entry]);
    if (ok) form.resetForm();
  }, [members, persist, feedback]);

  const toggleVip = useCallback(async (m: MemberEntry) => {
    const next = !m.isVip;
    setSaving(true);
    feedback.clear();
    try {
      const data = await setMemberVip(m, next);
      setMembers(sortMembersByJoinedDesc(data.members));
      const sess = getDiscordSession();
      if (sess?.discordId && m.discordId && sess.discordId === m.discordId) {
        setSessionVip(next);
      } else if (sess?.username && m.username && sess.username === m.username) {
        setSessionVip(next);
      }
      feedback.showOk(
        `@${m.username} (${displayMemberNickname(m)}) 님을 ${next ? 'VIP로 지정' : 'VIP 해제'}했습니다.`,
      );
    } catch (e) {
      feedback.showError(toUserFacingError(e instanceof Error ? e.message : 'VIP 설정에 실패했습니다.'));
    } finally {
      setSaving(false);
    }
  }, [feedback, setMembers]);

  const confirmWithdraw = useCallback(async () => {
    if (!withdrawTarget) return;
    setSaving(true);
    feedback.clear();
    try {
      const data = await withdrawMember(withdrawTarget);
      setMembers(sortMembersByJoinedDesc(data.members));
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
      feedback.showOk(parts.join(' '));
      setWithdrawTarget(null);
    } catch (e) {
      feedback.showError(toUserFacingError(e instanceof Error ? e.message : '탈퇴 처리에 실패했습니다.'));
    } finally {
      setSaving(false);
    }
  }, [withdrawTarget, feedback, setMembers]);

  return {
    saving,
    setSaving,
    withdrawTarget,
    setWithdrawTarget,
    handleAdd,
    toggleVip,
    confirmWithdraw,
  };
}
