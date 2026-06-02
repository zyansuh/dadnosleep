import { Plus } from 'lucide-react';

interface Props {
  newUsername:    string;
  newNickname:    string;
  saving:         boolean;
  hasRemote:      boolean;
  onUsernameChange: (v: string) => void;
  onNicknameChange: (v: string) => void;
  onAdd:          () => void;
}

export function MemberAddForm({
  newUsername, newNickname, saving, hasRemote,
  onUsernameChange, onNicknameChange, onAdd,
}: Props) {
  return (
    <div className="admin-member-add admin-member-add-form">
      <div className="admin-member-add-grid">
        <div className="admin-member-field admin-member-field--primary">
          <label className="fl admin-member-label-fluid" htmlFor="new-username">
            Discord @사용자명 또는 표시 이름 <span className="req">(필수)</span>
          </label>
          <input
            id="new-username"
            className="inp admin-member-inp"
            placeholder="예: cool_dad 또는 프로필에 보이는 이름"
            value={newUsername}
            onChange={e => onUsernameChange(e.target.value)}
            disabled={saving || !hasRemote}
            autoComplete="off"
          />
          <p className="admin-field-hint admin-field-hint--oneline">
            @이름·표시 이름 그대로 입력 · 로그인은 나중에 해도 됩니다
          </p>
        </div>
        <div className="admin-member-field admin-member-field--secondary">
          <label className="fl admin-member-label-fluid" htmlFor="new-nickname">
            사이트 닉네임 <span className="admin-optional">(선택)</span>
          </label>
          <input
            id="new-nickname"
            className="inp admin-member-inp"
            placeholder="비우면 Discord 이름 사용"
            value={newNickname}
            onChange={e => onNicknameChange(e.target.value)}
            disabled={saving || !hasRemote}
          />
        </div>
      </div>
      <button
        type="button"
        className="btn-modal-save admin-member-add-btn"
        onClick={onAdd}
        disabled={saving || !hasRemote || !newUsername.trim()}
      >
        <Plus size={16} /> 회원 추가
      </button>
    </div>
  );
}
