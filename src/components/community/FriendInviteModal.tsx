import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { POINTS_PER_FRIEND_INVITE } from '../../constants/points';
import { getMyNickname, validateNickname } from '../../utils/nickname';

interface Props {
  defaultNickname?: string | null;
  onSubmit: (inviterNickname: string, inviteeNickname: string) => Promise<void>;
  onClose:  () => void;
}

export function FriendInviteModal({ defaultNickname, onSubmit, onClose }: Props) {
  const [inviter, setInviter] = useState(
    () => defaultNickname?.trim() || getMyNickname() || '',
  );
  const [invitee, setInvitee] = useState('');
  const [inviterErr, setInviterErr] = useState('');
  const [inviteeErr, setInviteeErr] = useState('');
  const [done, setDone]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errInviter = validateNickname(inviter);
    const errInvitee = validateNickname(invitee);
    setInviterErr(errInviter ?? '');
    setInviteeErr(errInvitee ?? '');
    if (errInviter || errInvitee) return;

    const a = inviter.trim().toLowerCase();
    const b = invitee.trim().toLowerCase();
    if (a === b) {
      setInviteeErr('초대한 지인 닉네임은 내 닉네임과 달라야 합니다.');
      return;
    }

    if (saving) return;

    setSaving(true);
    setSaveErr('');
    try {
      await onSubmit(inviter.trim(), invitee.trim());
      setDone(true);
    } catch {
      setSaveErr('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !saving && onClose()}>
      <div className="modal friend-invite-modal">
        <div className="modal-hd">
          <div className="modal-title-row">
            <div className="modal-ico">🤝</div>
            <div>
              <h3>지인 초대 신고</h3>
              <p>
                초대 1건당 <strong style={{ color: '#ffd57a' }}>{POINTS_PER_FRIEND_INVITE.toLocaleString()}P</strong> 지급
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>

        {!done ? (
          <form className="modal-form" onSubmit={handleSubmit}>
            <p className="friend-invite-desc">
              동호회에 지인을 초대하셨다면 <strong>내 닉네임</strong>과 <strong>초대한 지인 닉네임</strong>을
              입력해 주세요. 포인트는 내 닉네임 기준으로 랭킹에 반영됩니다.
            </p>
            <div className="ff">
              <label className="fl">내 닉네임 <span className="req">*</span></label>
              <input
                className={`inp ${inviterErr ? 'inp-err' : ''}`}
                placeholder="후기에 쓴 닉네임과 동일하게"
                value={inviter}
                maxLength={20}
                onChange={e => { setInviter(e.target.value); setInviterErr(''); }}
                autoFocus
              />
              {inviterErr && <span className="fe">{inviterErr}</span>}
            </div>
            <div className="ff">
              <label className="fl">초대한 지인 닉네임 <span className="req">*</span></label>
              <input
                className={`inp ${inviteeErr ? 'inp-err' : ''}`}
                placeholder="초대받은 분의 닉네임"
                value={invitee}
                maxLength={20}
                onChange={e => { setInvitee(e.target.value); setInviteeErr(''); }}
              />
              {inviteeErr && <span className="fe">{inviteeErr}</span>}
            </div>

            {saveErr && <p className="fe" style={{ textAlign: 'center' }}>{saveErr}</p>}

            <div className="form-actions">
              <button type="button" className="btn-ghost-sm" onClick={onClose} disabled={saving}>취소</button>
              <button type="submit" className="btn-coral-form" disabled={saving}>
                <UserPlus size={14} /> {saving ? '저장 중…' : '지인 초대 완료 신고'}
              </button>
            </div>
          </form>
        ) : (
          <div className="success-box">
            <div className="success-emoji">🎉</div>
            <h3>지인 초대가 등록됐어요!</h3>
            <p>
              <strong>{inviter.trim()}</strong> → <strong>{invitee.trim()}</strong><br />
              <strong style={{ color: '#ffd57a' }}>{POINTS_PER_FRIEND_INVITE.toLocaleString()} 포인트</strong>가
              랭킹에 반영됐습니다.
            </p>
            <button
              className="btn-coral-form"
              style={{ flex: 'none', width: '100%', marginTop: 8 }}
              onClick={onClose}
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
