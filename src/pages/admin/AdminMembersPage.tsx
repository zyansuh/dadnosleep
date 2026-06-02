import { useCallback, useEffect, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import {
  createMemberEntry,
  hasMembersRemote,
  loadMembersBin,
  saveMembersBin,
  updateMemberFields,
  type MemberEntry,
} from '../../utils/membersStore';
import { validateNickname } from '../../utils/nickname';
import { ConfirmModal } from '../../components/ConfirmModal';

function formatJoinedAt(iso: string): string {
  if (!iso) return '—';
  return iso.slice(0, 10);
}

function displayNickname(m: MemberEntry): string {
  return m.nickname?.trim() || m.globalName?.trim() || m.username || '—';
}

export function AdminMembersPage() {
  const [members, setMembers]     = useState<MemberEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [newId, setNewId]           = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState<string | null>(null);
  const [editingId, setEditingId]   = useState<string | null>(null);
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
      setError('VITE_JSONBIN_BIN_MEMBERS 또는 Access Key가 설정되지 않았습니다.');
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
    const id = newId.trim();
    const username = newUsername.trim();
    if (!/^\d{17,20}$/.test(id)) {
      setError('Discord ID는 17~20자리 숫자여야 합니다.');
      return;
    }
    if (!username) {
      setError('username은 필수입니다.');
      return;
    }
    const nickErr = newNickname.trim() ? validateNickname(newNickname) : null;
    if (nickErr) {
      setError(nickErr);
      return;
    }
    if (members.some(m => m.discordId === id)) {
      setError('이미 등록된 Discord ID입니다.');
      return;
    }
    const entry = createMemberEntry({
      discordId: id,
      username,
      nickname: newNickname.trim() || undefined,
    });
    await persist([...members, entry]);
    setNewId('');
    setNewUsername('');
    setNewNickname('');
  };

  const startEdit = (m: MemberEntry) => {
    setEditingId(m.discordId);
    setEditNickname(displayNickname(m));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNickname('');
  };

  const saveEdit = async (discordId: string) => {
    const err = validateNickname(editNickname);
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateMemberFields(discordId, { nickname: editNickname.trim() });
      setMembers(prev => prev.map(m =>
        m.discordId === discordId ? { ...m, nickname: editNickname.trim() } : m,
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
    const next = members.filter(m => m.discordId !== removeTarget.discordId);
    await persist(next);
    setRemoveTarget(null);
  };

  return (
    <div className="admin-page-body">
      <h2 className="admin-panel-title">회원 명단 관리</h2>
      <p className="admin-page-desc">
        Discord ID·username·닉네임을 관리합니다. 명단에서 제거된 회원은 다음 로그인부터 guest 등급이 됩니다.
      </p>

      {!hasMembersRemote && (
        <p className="admin-alert admin-alert-warn">
          VITE_JSONBIN_ACCESS_KEY와 VITE_JSONBIN_BIN_ID(또는 전용 VITE_JSONBIN_BIN_MEMBERS)를
          .env / Vercel에 설정한 뒤 dev 서버 또는 사이트를 재시작해주세요.
        </p>
      )}

      <div className="admin-member-add admin-member-add-form">
        <div className="admin-member-add-grid">
          <div>
            <label className="fl" htmlFor="new-discord-id">Discord ID (필수)</label>
            <input
              id="new-discord-id"
              className="inp"
              placeholder="123456789012345678"
              value={newId}
              onChange={e => setNewId(e.target.value)}
              disabled={saving || !hasMembersRemote}
            />
          </div>
          <div>
            <label className="fl" htmlFor="new-username">username (필수)</label>
            <input
              id="new-username"
              className="inp"
              placeholder="discord_username"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              disabled={saving || !hasMembersRemote}
            />
          </div>
          <div>
            <label className="fl" htmlFor="new-nickname">닉네임 (선택)</label>
            <input
              id="new-nickname"
              className="inp"
              placeholder="비우면 username 사용"
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
          disabled={saving || !hasMembersRemote || !newId.trim() || !newUsername.trim()}
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
              <th>Discord ID</th>
              <th>username</th>
              <th>닉네임</th>
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
                const editing = editingId === m.discordId;
                return (
                  <tr key={m.discordId}>
                    <td><code className="admin-code">{m.discordId}</code></td>
                    <td>{m.username || '—'}</td>
                    <td className="admin-nickname-cell">
                      {editing ? (
                        <input
                          className="inp inp-inline"
                          value={editNickname}
                          onChange={e => setEditNickname(e.target.value)}
                          maxLength={20}
                          onKeyDown={e => {
                            if (e.key === 'Enter') void saveEdit(m.discordId);
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
                    <td>{formatJoinedAt(m.joinedAt)}</td>
                    <td className="admin-table-actions">
                      {editing ? (
                        <>
                          <button
                            type="button"
                            className="admin-row-save"
                            disabled={saving}
                            onClick={() => void saveEdit(m.discordId)}
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
          message={`${displayNickname(removeTarget)} (${removeTarget.discordId}) 님을 명단에서 제거할까요? 제거 후 로그인 시 guest 등급이 적용됩니다.`}
          confirmLabel="제거"
          danger
          onConfirm={() => void confirmRemove()}
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
