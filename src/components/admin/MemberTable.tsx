import { Check, Trash2, X } from 'lucide-react';
import { getMemberRowKey, type MemberEntry } from '../../utils/members/membersStore';
import { formatJoinedAt, displayMemberNickname } from '../../utils/members/memberDisplay';
import { MemberMobileList } from './MemberMobileList';

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

export function MemberTable({
  members, loading, saving, editingKey, editNickname,
  onEditNicknameChange, onStartEdit, onCancelEdit, onSaveEdit, onRemove,
}: Props) {
  const listProps = {
    members, loading, saving, editingKey, editNickname,
    onEditNicknameChange, onStartEdit, onCancelEdit, onSaveEdit, onRemove,
  };

  return (
    <div className="admin-table-wrap admin-table-wrap--members">
      <MemberMobileList {...listProps} />
      <table className="admin-table admin-table--desktop">
        <thead>
          <tr>
            <th>등록 식별 이름</th>
            <th>사이트 닉네임</th>
            <th>연동</th>
            <th>가입일</th>
            <th>수정</th>
            <th>제거</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="admin-table-empty">불러오는 중…</td>
            </tr>
          ) : members.length === 0 ? (
            <tr>
              <td colSpan={6} className="admin-table-empty">
                등록된 회원이 없습니다. 위에서 <strong>@사용자명 또는 표시 이름</strong>을 추가한 뒤 저장하면,
                해당 계정으로 로그인할 때 member 등급이 부여됩니다. (JSONBin에 동기화됩니다)
              </td>
            </tr>
          ) : (
            members.map(m => {
              const rowKey = getMemberRowKey(m);
              const editing = editingKey === rowKey;
              return (
                <tr key={rowKey}>
                  <td>
                    <strong className="admin-username">@{m.username || '—'}</strong>
                  </td>
                  <td className="admin-nickname-cell">
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
                      <button
                        type="button"
                        className="admin-nickname-btn"
                        onClick={() => onStartEdit(m)}
                        title="클릭하여 수정"
                      >
                        {displayMemberNickname(m)}
                      </button>
                    )}
                  </td>
                  <td>
                    {m.discordId ? (
                      <span className="admin-linked-badge" title={m.discordId}>로그인 연동됨</span>
                    ) : (
                      <span className="admin-pending-badge">로그인 대기</span>
                    )}
                  </td>
                  <td>{formatJoinedAt(m.joinedAt)}</td>
                  <td className="admin-table-actions">
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
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="admin-row-edit"
                        onClick={() => onStartEdit(m)}
                      >
                        수정
                      </button>
                    )}
                  </td>
                  <td className="admin-table-actions">
                    <button
                      type="button"
                      className="admin-row-remove"
                      disabled={saving}
                      onClick={() => onRemove(m)}
                    >
                      <Trash2 size={15} /> 제거
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
