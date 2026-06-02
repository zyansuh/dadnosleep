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
        <div>
          <label className="fl" htmlFor="new-username">Discord @사용자명 또는 표시 이름 (필수)</label>
          <input
            id="new-username"
            className="inp"
            placeholder="예: cool_dad 또는 프로필에 보이는 이름"
            value={newUsername}
            onChange={e => onUsernameChange(e.target.value)}
            disabled={saving || !hasRemote}
            autoComplete="off"
          />
          <p className="admin-field-hint">
            프로필 → 사용자명(@) 또는 서버에 보이는 표시 이름을 그대로 입력하세요. @, #, : 는 제외됩니다.
            대상 회원의 Discord 로그인은 필요 없습니다.
          </p>
        </div>
        <div>
          <label className="fl" htmlFor="new-nickname">사이트 닉네임 (선택)</label>
          <input
            id="new-nickname"
            className="inp"
            placeholder="비우면 사용자명 사용"
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
