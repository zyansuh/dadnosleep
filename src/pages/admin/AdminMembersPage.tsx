import { useCallback, useEffect, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import {
  createMemberEntry,
  getMemberRowKey,
  hasMembersRemote,
  isUsernameTaken,
  loadMembersBin,
  saveMembersBin,
  updateMemberFields,
  type MemberEntry,
} from '../../utils/membersStore';
import { validateNickname } from '../../utils/nickname';
import { validateDiscordUsername } from '../../utils/memberIdentity';
import { ConfirmModal } from '../../components/ConfirmModal';

function formatJoinedAt(iso: string): string {
  if (!iso) return '—';
  return iso.slice(0, 10);
}

function displayNickname(m: MemberEntry): string {
  return m.nickname?.trim() || m.globalName?.trim() || m.username || '—';
}

export function AdminMembersPage() {
  const [members, setMembers]         = useState<MemberEntry[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState<string | null>(null);
  const [editingKey, setEditingKey]   = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState('');
  const [removeTarget, setRemoveTarget] = useState<MemberEntry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadMembersBin();
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

  const persist = async (next: MemberEntry[]) => {
    if (!hasMembersRemote) {
      setError('JSONBin Access Key 또는 Bin ID가 설정되지 않았습니다.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await saveMembersBin({ members: next });
      setMembers(next);
      setSuccess('저장되었습니다.');
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const username = newUsername.trim();
    const userErr = validateDiscordUsername(username);
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
      setError('이미 등록된 Discord 사용자명입니다.');
      return;
    }
    const entry = createMemberEntry({
      username,
      nickname: newNickname.trim() || undefined,
    });
    await persist([...members, entry]);
    setNewUsername('');
    setNewNickname('');
  };

  const startEdit = (m: MemberEntry) => {
    setEditingKey(getMemberRowKey(m));
    setEditNickname(displayNickname(m));
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditNickname('');
  };

  const saveEdit = async (m: MemberEntry) => {
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
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    const key = getMemberRowKey(removeTarget);
    const next = members.filter(m => getMemberRowKey(m) !== key);
    await persist(next);
    setRemoveTarget(null);
  };

  return (
    <div className="admin-page-body">
      <h2 className="admin-panel-title">회원 명단 관리</h2>
      <p className="admin-page-desc">
        Discord <strong>사용자명(username)</strong>으로 동호회 회원을 등록합니다.
        첫 로그인 시 Discord ID가 자동으로 연동됩니다. 명단에서 제거된 회원은 다음 로그인부터 guest입니다.
      </p>

      {!hasMembersRemote && (
        <p className="admin-alert admin-alert-warn">
          VITE_JSONBIN_ACCESS_KEY와 VITE_JSONBIN_BIN_ID(또는 VITE_JSONBIN_BIN_MEMBERS)를
          .env / Vercel에 설정한 뒤 dev 서버 또는 사이트를 재시작해주세요.
        </p>
      )}

      <div className="admin-member-add admin-member-add-form">
        <div className="admin-member-add-grid">
          <div>
            <label className="fl" htmlFor="new-username">Discord 사용자명 (필수)</label>
            <input
              id="new-username"
              className="inp"
              placeholder="예: 1000hyehyang1"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              disabled={saving || !hasMembersRemote}
              autoComplete="off"
            />
            <p className="admin-field-hint">Discord 앱 → 내 프로필에 표시된 @사용자명 (구 형식 #태그 아님)</p>
          </div>
          <div>
            <label className="fl" htmlFor="new-nickname">사이트 닉네임 (선택)</label>
            <input
              id="new-nickname"
              className="inp"
              placeholder="비우면 사용자명 사용"
              value={newNickname}
              onChange={e => setNewNickname(e.target.value)}
              disabled={saving || !hasMembersRemote}
            />
          </div>
        </div>
        <button
          type="button"
          className="btn-modal-save admin-member-add-btn"
          onClick={() => void handleAdd()}
          disabled={saving || !hasMembersRemote || !newUsername.trim()}
        >
          <Plus size={16} /> 회원 추가
        </button>
      </div>

      {error && <p className="admin-alert admin-alert-error">{error}</p>}
      {success && <p className="admin-alert admin-alert-ok">{success}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Discord 사용자명</th>
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
                <td colSpan={6} className="admin-table-empty">등록된 회원이 없습니다.</td>
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
                          onChange={e => setEditNickname(e.target.value)}
                          maxLength={20}
                          onKeyDown={e => {
                            if (e.key === 'Enter') void saveEdit(m);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                        />
                      ) : (
                        <button
                          type="button"
                          className="admin-nickname-btn"
                          onClick={() => startEdit(m)}
                          title="클릭하여 수정"
                        >
                          {displayNickname(m)}
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
                            onClick={() => void saveEdit(m)}
                          >
                            <Check size={14} /> 저장
                          </button>
                          <button type="button" className="admin-row-cancel" onClick={cancelEdit}>
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="admin-row-edit"
                          onClick={() => startEdit(m)}
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
                        onClick={() => setRemoveTarget(m)}
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

      {removeTarget && (
        <ConfirmModal
          title="회원 제거"
          message={`@${removeTarget.username} (${displayNickname(removeTarget)}) 님을 명단에서 제거할까요? 제거 후 로그인 시 guest 등급이 적용됩니다.`}
          confirmLabel="제거"
          danger
          onConfirm={() => void confirmRemove()}
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
