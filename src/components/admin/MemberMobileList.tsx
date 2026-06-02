import { Check, UserMinus, X } from 'lucide-react';
import type { MemberListFilter } from './MemberListToolbar';
import { getMemberRowKey, type MemberEntry } from '../../utils/members/membersStore';
import { formatJoinedAt, displayMemberNickname } from '../../utils/members/memberDisplay';
import { memberListEmptyMessage } from '../../utils/members/memberListMessages';

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

export function MemberMobileList({
  members, loading, saving, editingKey, editNickname,
  listFilter,
  onEditNicknameChange, onStartEdit, onCancelEdit, onSaveEdit, onWithdraw, onToggleVip,
}: Props) {
  if (loading) {
    return <p className="admin-table-empty admin-member-mobile-empty">불러오는 중…</p>;
  }
  if (members.length === 0) {
    return (
      <p className="admin-table-empty admin-member-mobile-empty admin-empty-oneline">
        {memberListEmptyMessage(listFilter)}
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
                <span className="admin-linked-badge">로그인 완료</span>
              ) : (
                <span className="admin-pending-badge">로그인 전</span>
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
              <button
                type="button"
                className={`admin-vip-toggle${m.isVip ? ' is-vip' : ''}`}
                disabled={saving}
                onClick={() => void onToggleVip(m)}
              >
                {m.isVip ? '👑 VIP' : 'VIP 지정'}
              </button>
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
                className="admin-row-withdraw"
                disabled={saving}
                onClick={() => onWithdraw(m)}
              >
                <UserMinus size={15} /> 탈퇴
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
