import { Check, Trash2, X } from 'lucide-react';
import { getMemberRowKey, type MemberEntry } from '../../utils/members/membersStore';
import { formatJoinedAt, displayMemberNickname } from '../../utils/members/memberDisplay';

interface Props {
  members:        MemberEntry[];
  loading:        boolean;
  saving:         boolean;
  editingKey:     string | null;
  editNickname:   string;
  onEditNicknameChange: (v: string) => void;
  onStartEdit:    (m: MemberEntry) => void;
  onCancelEdit:   () => void;
  onSaveEdit:     (m: MemberEntry) => void;
  onRemove:       (m: MemberEntry) => void;
}

export function MemberMobileList({
  members, loading, saving, editingKey, editNickname,
  onEditNicknameChange, onStartEdit, onCancelEdit, onSaveEdit, onRemove,
}: Props) {
  if (loading) {
    return <p className="admin-table-empty admin-member-mobile-empty">불러오는 중…</p>;
  }
  if (members.length === 0) {
    return (
      <p className="admin-table-empty admin-member-mobile-empty">
        등록된 회원이 없습니다. 위에서 추가한 뒤 저장하면 로그인 시 member 등급이 부여됩니다.
      </p>
    );
  }

  return (
    <ul className="admin-member-mobile-list" aria-label="회원 명단">
      {members.map(m => {
        const rowKey = getMemberRowKey(m);
        const editing = editingKey === rowKey;
        return (
          <li key={rowKey} className="admin-member-mobile-card">
            <div className="admin-member-mobile-card-hd">
              <strong className="admin-username">@{m.username || '—'}</strong>
              {m.discordId ? (
                <span className="admin-linked-badge">연동됨</span>
              ) : (
                <span className="admin-pending-badge">대기</span>
              )}
            </div>
            <dl className="admin-member-mobile-meta">
              <dt>닉네임</dt>
              <dd>
                {editing ? (
                  <input
                    className="inp inp-inline"
                    value={editNickname}
                    onChange={e => onEditNicknameChange(e.target.value)}
                    maxLength={20}
                    onKeyDown={e => {
                      if (e.key === 'Enter') void onSaveEdit(m);
                      if (e.key === 'Escape') onCancelEdit();
                    }}
                    autoFocus
                  />
                ) : (
                  displayMemberNickname(m)
                )}
              </dd>
              <dt>가입일</dt>
              <dd>{formatJoinedAt(m.joinedAt)}</dd>
            </dl>
            <div className="admin-member-mobile-actions">
              {editing ? (
                <>
                  <button
                    type="button"
                    className="admin-row-save"
                    disabled={saving}
                    onClick={() => void onSaveEdit(m)}
                  >
                    <Check size={14} /> 저장
                  </button>
                  <button type="button" className="admin-row-cancel" onClick={onCancelEdit}>
                    <X size={14} /> 취소
                  </button>
                </>
              ) : (
                <button type="button" className="admin-row-edit" onClick={() => onStartEdit(m)}>
                  수정
                </button>
              )}
              <button
                type="button"
                className="admin-row-remove"
                disabled={saving}
                onClick={() => onRemove(m)}
              >
                <Trash2 size={15} /> 제거
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
