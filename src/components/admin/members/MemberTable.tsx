import { Check, UserMinus, X } from 'lucide-react';
import type { MemberListFilter } from './MemberListToolbar';
import { getMemberRowKey, type MemberEntry } from '../../../utils/members/membersStore';
import { formatJoinedAt, displayMemberNickname } from '../../../utils/members/memberDisplay';
import { MemberMobileList } from './MemberMobileList';
import { memberListEmptyMessage } from '../../../utils/members/memberListMessages';

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
  listFilter:     MemberListFilter;
  onWithdraw:     (m: MemberEntry) => void;
  onToggleVip:    (m: MemberEntry) => void;
}

export function MemberTable({
  members, loading, saving, editingKey, editNickname,
  listFilter,
  onEditNicknameChange, onStartEdit, onCancelEdit, onSaveEdit, onWithdraw, onToggleVip,
}: Props) {
  const listProps = {
    members, loading, saving, editingKey, editNickname,
    listFilter,
    onEditNicknameChange, onStartEdit, onCancelEdit, onSaveEdit, onWithdraw, onToggleVip,
  };

  return (
    <div className="admin-table-wrap admin-table-wrap--members">
      <MemberMobileList {...listProps} />
      <table className="admin-table admin-table--desktop">
        <thead>
          <tr>
            <th>Discord 이름</th>
            <th>닉네임</th>
            <th>로그인</th>
            <th>VIP</th>
            <th>가입일</th>
            <th>수정</th>
            <th>탈퇴</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="admin-table-empty admin-empty-oneline">불러오는 중…</td>
            </tr>
          ) : members.length === 0 ? (
            <tr>
              <td colSpan={7} className="admin-table-empty admin-empty-oneline">
                {memberListEmptyMessage(listFilter)}
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
                      <span className="admin-linked-badge" title={m.discordId}>완료</span>
                    ) : (
                      <span className="admin-pending-badge">대기</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`admin-vip-toggle${m.isVip ? ' is-vip' : ''}`}
                      disabled={saving}
                      onClick={() => void onToggleVip(m)}
                      title={m.isVip ? 'VIP 해제' : 'VIP 지정'}
                    >
                      {m.isVip ? '👑 VIP' : '일반'}
                    </button>
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
                      className="admin-row-withdraw"
                      disabled={saving}
                      onClick={() => onWithdraw(m)}
                      title="동호회 탈퇴 처리"
                    >
                      <UserMinus size={15} /> 탈퇴
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
