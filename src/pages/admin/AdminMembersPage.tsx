import { ConfirmModal } from '../../components/ConfirmModal';
import { MemberAddForm } from '../../components/admin/MemberAddForm';
import { MemberTable } from '../../components/admin/MemberTable';
import { useAdminMembers } from '../../hooks/admin/useAdminMembers';
import { displayMemberNickname } from '../../utils/members/memberDisplay';

export function AdminMembersPage() {
  const m = useAdminMembers();

  return (
    <div className="admin-page-body">
      <h2 className="admin-panel-title">회원 명단 관리</h2>
      <p className="admin-page-desc">
        Discord <strong>@사용자명</strong> 또는 <strong>표시 이름</strong>(한글·이모지·특수문자 포함 가능)으로
        동호회 회원을 등록합니다. <strong>추가할 회원이 아직 로그인하지 않아도 됩니다</strong> — 명단에만 올려 두면
        나중에 해당 계정으로 첫 로그인할 때 member 등급이 부여됩니다.
      </p>
      <p className="admin-page-desc admin-page-desc-sub">
        관리자 페이지는 Discord 로그인 없이도 <strong>푸터 관리자 링크 + 비밀번호</strong>로 들어올 수 있습니다.
        다만 저장은 <strong>JSONBin 환경변수</strong>가 빌드에 포함되어 있어야 합니다 (로컬은 <code>.env.local</code>, 배포는 Vercel 재배포).
      </p>

      {!m.hasRemote() && (
        <p className="admin-alert admin-alert-warn">
          VITE_JSONBIN_ACCESS_KEY와 VITE_JSONBIN_BIN_ID(또는 VITE_JSONBIN_BIN_MEMBERS)를
          Vercel 환경변수에 설정한 뒤 <strong>재배포</strong>해주세요. (Vite는 빌드 시점에 env를 박아 넣습니다)
        </p>
      )}

      <MemberAddForm
        newUsername={m.newUsername}
        newNickname={m.newNickname}
        saving={m.saving}
        hasRemote={m.hasRemote()}
        onUsernameChange={m.setNewUsername}
        onNicknameChange={m.setNewNickname}
        onAdd={() => void m.handleAdd()}
      />

      {m.error && <p className="admin-alert admin-alert-error">{m.error}</p>}
      {m.success && <p className="admin-alert admin-alert-ok">{m.success}</p>}

      <MemberTable
        members={m.members}
        loading={m.loading}
        saving={m.saving}
        editingKey={m.editingKey}
        editNickname={m.editNickname}
        onEditNicknameChange={m.setEditNickname}
        onStartEdit={m.startEdit}
        onCancelEdit={m.cancelEdit}
        onSaveEdit={m.saveEdit}
        onRemove={m.setRemoveTarget}
      />

      {m.removeTarget && (
        <ConfirmModal
          title="회원 제거"
          message={`@${m.removeTarget.username} (${displayMemberNickname(m.removeTarget)}) 님을 명단에서 제거할까요? 제거 후 로그인 시 guest 등급이 적용됩니다.`}
          confirmLabel="제거"
          danger
          onConfirm={() => void m.confirmRemove()}
          onClose={() => m.setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
